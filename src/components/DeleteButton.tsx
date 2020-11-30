import { Component, ReactNode, createElement } from "react";
import { Pressable, View } from "react-native";
import { DynamicValue, NativeIcon, ValueStatus } from "mendix";
import { Icon } from "mendix/components/native/Icon";

import { CustomStyle } from "../NativePinInput";

export interface DeleteButtonProps {
    deleteButtonIcon: DynamicValue<NativeIcon>;
    style: CustomStyle;
    onClick: () => void;
}

export class DeleteButton extends Component<DeleteButtonProps> {
    private defaultIconGlyph = "glyphicon-trash";

    render(): ReactNode {
        return (
            <Pressable onPress={() => this.onClick()}>
                {this.renderIcon(this.defaultIconGlyph, this.props.deleteButtonIcon)}
            </Pressable>
        );
    }

    onClick(): void {
        this.props.onClick();
    }

    private renderIcon = (glyph: string, toBeRenderedIcon?: DynamicValue<NativeIcon>): ReactNode => {
        const nativeIcon: NativeIcon =
            toBeRenderedIcon && toBeRenderedIcon.status === ValueStatus.Available
                ? toBeRenderedIcon.value
                : { type: "glyph", iconClass: glyph };
        // Do not apply styling to touchable, but to the child view
        return (
            <View style={this.props.style.deleteButtonTouchable}>
                <Icon
                    color={this.props.style.icon.color as string}
                    icon={nativeIcon}
                    size={this.props.style.icon.fontSize}
                />
            </View>
        );
    };
}
