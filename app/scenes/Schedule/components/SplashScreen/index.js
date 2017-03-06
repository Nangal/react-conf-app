// @flow
import React, { Component } from 'react';
import {
	Animated,
	Dimensions,
	Image,
	StyleSheet,
	TouchableHighlight,
	View,
} from 'react-native';

import theme from '../../../../theme';

const windowHeight = Dimensions.get('window').height;
const SLIDE_DURATION = 800;
const SLIDE_FINAL_HEIGHT = 400;

const HEIGHT_OFFSET = 200;
const STATUSBAR_HEIGHT = 20;

const SKEW_DELAY = 3000;
const SKEW_DURATION = 2000;
const SKEW_UP = -3;
const SKEW_DOWN = 5;

Animated.TouchableHighlight = Animated.createAnimatedComponent(TouchableHighlight);

export default class SplashScreen extends Component {
	props: {
		animated?: boolean,
		onAnimationComplete?: () => mixed,
		onLogoPress?: () => mixed,
	};

	state = {
		height: new Animated.Value(this.props.animated ? windowHeight + SLIDE_FINAL_HEIGHT : SLIDE_FINAL_HEIGHT),
		logoOffset: new Animated.Value(this.props.animated ? 0 : 48),
		logoScale: new Animated.Value(this.props.animated ? 1 : 0.8),
		leftTriangleSkew: new Animated.Value(SKEW_DOWN),
		rightTriangleSkew: new Animated.Value(SKEW_UP),
	};

	skewed = false;

	componentDidMount () {
		if (this.props.animated) {
			const animateTo = (toValue) => {
				return {
					delay: 1000,
					duration: SLIDE_DURATION,
					toValue,
				};
			};

			Animated.parallel([
				Animated.timing(this.state.logoOffset, animateTo(80)),
				Animated.timing(this.state.logoScale, animateTo(0.8)),
				Animated.timing(this.state.height, animateTo(SLIDE_FINAL_HEIGHT + theme.navbar.height)),
			]).start(() => {
				if (this.props.onAnimationComplete) {
					this.props.onAnimationComplete();
				}
			});
		} else {
			this.queueIdleAnimation();
		}
	}
	queueIdleAnimation = () => {
		const { leftTriangleSkew, rightTriangleSkew } = this.state;

		const animateTo = (toValue) => {
			return {
				duration: SKEW_DURATION,
				toValue,
			};
		};

		const leftSkew = this.skewed ? SKEW_UP : SKEW_DOWN;
		const rightSkew = this.skewed ? SKEW_DOWN : SKEW_UP;

		// Toggle for next time
		this.skewed = !this.skewed;

		Animated.parallel([
			// -------- Left Triangle --------
			Animated.timing(leftTriangleSkew, animateTo(leftSkew)),
			Animated.timing(rightTriangleSkew, animateTo(rightSkew)),
		]).start(() => {
			setTimeout(() => this.queueIdleAnimation(), SKEW_DELAY);
		});
	}

	render () {
		const { height, logoOffset, logoScale, leftTriangleSkew, rightTriangleSkew } = this.state;

		// Map to string values for transform.
		const interpolateToString = (value) => {
			return value.interpolate({
				inputRange: [-360, 360],
				outputRange: ['-360deg', '360deg'],
			});
		};

		return (
			<View style={styles.wrapper}>
				{/* I'm a spacer to push other content below me down */}
				<View style={{ height: SLIDE_FINAL_HEIGHT - (HEIGHT_OFFSET + STATUSBAR_HEIGHT) }} />
					{/* The actual splash screen */}
					<Animated.View
						style={[styles.splash, { height }]}
					>
						<Animated.TouchableHighlight underlayColor="transparent"
							onPress={() => {
								if (this.props.onLogoPress) this.props.onLogoPress();
							}}
							style={{
								transform: [
									{ translateY: logoOffset },
									{ scale: logoScale },
								],
								zIndex: 2,
							}}
						>
							<Image
								source={require('../../images/splash-logo.png')}
							/>
						</Animated.TouchableHighlight>
						<Animated.View
							style={[styles.bottomTriangle, { transform: [
								{ skewY: interpolateToString(leftTriangleSkew) },
							] }]}
						/>
						<Animated.View
							style={[styles.bottomTriangle, { transform: [
								{ skewY: interpolateToString(rightTriangleSkew) },
								{ translateY: -5 },
							] }]}
						/>
					</Animated.View>
			</View>
		);
	}
};

const styles = StyleSheet.create({
	wrapper: {
		zIndex: 2,
	},

	splash: {
		position: 'absolute',
		alignItems: 'center',
		justifyContent: 'center',
		top: -HEIGHT_OFFSET,
		left: 0,
		right: 0,
	},

	bottomTriangle: {
		position: 'absolute',
		backgroundColor: 'rgba(36, 31, 32, 0.8)',
		bottom: 40,
		left: -100,
		right: -100,
		height: 1200,
	},
});
