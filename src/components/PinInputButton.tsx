import { Component, ReactNode, createElement } from "react";
import { Pressable, Text, View } from "react-native";

import { CustomStyle } from "../NativePinInput";

export interface PinInputButtonProps {
    caption: string;
    style: CustomStyle;
    onClick: (value: string) => void;
}

export class PinInputButton extends Component<PinInputButtonProps> {
    render(): ReactNode {
        return (
            <Pressable onPress={() => this.onClick()}>
                <View style={this.props.style.pinInputView}>
                    <Text style={this.props.style.caption}>{this.props.caption}</Text>
                </View>
            </Pressable>
        );
    }

    onClick(): void {
        this.props.onClick(this.props.caption);
    }
}
