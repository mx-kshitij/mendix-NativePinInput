import { ReactElement, createElement, useMemo } from "react";
import { Pressable, View } from "react-native";
import { DynamicValue, NativeIcon, ValueStatus } from "mendix";
import { Icon } from "mendix/components/native/Icon";
import { CustomStyle } from "src/ui/styles";

export interface DeleteButtonProps {
    deleteButtonIcon: DynamicValue<NativeIcon>;
    style: CustomStyle;
    onClick: () => void;
}

export function DeleteButton({ deleteButtonIcon, style, onClick }: DeleteButtonProps): ReactElement {
    const renderIcon = useMemo((): ReactElement => {
        const defaultIconGlyph = "glyphicon-trash";
        const nativeIcon: NativeIcon =
            deleteButtonIcon && deleteButtonIcon.status === ValueStatus.Available
                ? deleteButtonIcon.value
                : { type: "glyph", iconClass: defaultIconGlyph };
        // Do not apply styling to pressable, but to the child view
        return (
            <View style={style.deleteButtonTouchable}>
                <Icon color={style.icon.color as string} icon={nativeIcon} size={style.icon.fontSize} />
            </View>
        );
    }, [deleteButtonIcon, style]);

    return <Pressable onPress={() => onClick()}>{renderIcon}</Pressable>;
}
