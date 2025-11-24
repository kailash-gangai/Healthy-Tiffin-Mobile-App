import * as React from "react";
import Svg, { G, Mask, Path, Defs, LinearGradient, Stop, ClipPath, Rect } from "react-native-svg";

export default function CartSwipeNotch(props) {
      return (
            <Svg width={70} height={17} viewBox="0 0 70 17" fill="none" {...props}>
                  <G clipPath="url(#clip0)">
                        <Mask id="mask0" maskUnits="userSpaceOnUse" x="0" y="0" width="70" height="17">
                              <Path d="M70 0H0V17H70V0Z" fill="#fff" />
                        </Mask>

                        <G mask="url(#mask0)">
                              <Path
                                    d="M194.782 0C211.591 0 225.217 13.4315 225.217 30C225.217 31.6569 223.855 33 222.174 33H-152.174C-153.855 33 -155.218 31.6569 -155.218 30C-155.218 13.4315 -141.592 0 -124.783 0H-3.55719C0.462232 0 2.47193 0 4.40454 0.373233C6.0115 0.683591 7.57483 1.18454 9.05903 1.86515C10.8445 2.68364 12.4698 3.84893 15.7212 6.17952C22.7608 11.2264 26.2811 13.7498 30.1412 14.6882C33.3318 15.464 36.6674 15.464 39.858 14.6882C43.7182 13.7498 47.2384 11.2264 54.278 6.17952C57.5295 3.84893 59.1547 2.68364 60.9402 1.86515C62.4244 1.18454 63.9877 0.683591 65.5947 0.373233C67.5273 0 69.537 0 73.5564 0H194.782Z"
                                    fill="url(#paint0)"
                              />
                        </G>
                  </G>

                  <Defs>
                        <LinearGradient
                              id="paint0"
                              x1="-155.218"
                              y1="4.125"
                              x2="-30.0382"
                              y2="-162.895"
                              gradientUnits="userSpaceOnUse"
                        >
                              <Stop stopColor="#333333" />
                              <Stop offset={1} stopColor="#181818" />
                        </LinearGradient>

                        <ClipPath id="clip0">
                              <Rect width={70} height={17} fill="white" />
                        </ClipPath>
                  </Defs>
            </Svg>
      );
}
