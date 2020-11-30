import { Component, ReactNode, createElement } from "react";
import { NativeModules, Text, TextStyle, ViewStyle, View, TextInput } from "react-native";
import { NativePinInputProps } from "../typings/NativePinInputProps";
import { Style, flattenStyles } from "./utils/common";
import { commonStyles, circleStyles, numKeyboardStyles, darkStyles, lightStyles } from "./ui/styles";
import { PinInputButton } from "./components/PinInputButton";
import { ValueStatus } from "mendix";
import { DeleteButton } from "./components/DeleteButton";

export interface CustomStyle extends Style {
    container: ViewStyle;
    readonlyText: TextStyle;
    buttonRow: ViewStyle;
    valueRow: ViewStyle;
    pinInputView: ViewStyle;
    deleteButtonTouchable: ViewStyle;
    emptyContainer: ViewStyle;
    icon: TextStyle;
    caption: TextStyle;
    validationMessage: TextStyle;
}

const defaultStyle: CustomStyle = {
    container: commonStyles.container,
    readonlyText: commonStyles.readonlyText,
    buttonRow: commonStyles.buttonRow,
    valueRow: commonStyles.valueRow,
    pinInputView: commonStyles.pinInputView,
    deleteButtonTouchable: commonStyles.deleteButtonTouchable,
    icon: commonStyles.icon,
    emptyContainer: commonStyles.emptyContainer,
    caption: commonStyles.caption,
    validationMessage: commonStyles.validationMessage
};

interface State {
    textValue: string;
    displayValue: string;
}

// Mendix 9 is different!
// Safely check if Appearance API is available in this version of React Native
const Appearance = require("react-native").Appearance;
const deviceDarkMode =
    NativeModules && NativeModules.RNDarkMode && NativeModules.RNDarkMode.initialMode
        ? NativeModules.RNDarkMode.initialMode === "dark"
        : Appearance
        ? Appearance.getColorScheme() === "dark"
        : false;

export class NativePinInput extends Component<NativePinInputProps<CustomStyle>, State> {
    private readonly mergedStyle: CustomStyle;

    state = {
        textValue: "",
        displayValue: ""
    };

    constructor(props: NativePinInputProps<CustomStyle>) {
        super(props);

        // Insert additional styles based on properties.
        // These must be placed at the top of the array, using unshift, to allow overrule by project theme styles and design properties.
        const styleArray: CustomStyle[] = [...this.props.style];
        switch (this.props.darkMode) {
            case "dark":
                styleArray.unshift(darkStyles);
                break;

            case "light":
                styleArray.unshift(lightStyles);
                break;

            default:
                if (deviceDarkMode) {
                    styleArray.unshift(darkStyles);
                } else {
                    styleArray.unshift(lightStyles);
                }
        }
        if (this.props.buttonStyle === "circle") {
            styleArray.unshift(circleStyles);
        } else {
            styleArray.unshift(numKeyboardStyles);
        }
        this.mergedStyle = flattenStyles(defaultStyle, styleArray);

        this.onClick = this.onClick.bind(this);
        this.onDeleteClick = this.onDeleteClick.bind(this);
    }

    componentDidUpdate(prevProps: NativePinInputProps<CustomStyle>): void {
        const { dataAttr: prevDataAttr } = prevProps;
        const { dataAttr } = this.props;

        if (
            prevDataAttr &&
            prevDataAttr.status === ValueStatus.Available &&
            dataAttr &&
            dataAttr.status === ValueStatus.Available
        ) {
            if (prevDataAttr.value && !dataAttr.value) {
                // Clear state if we receive empty value
                this.setState({
                    displayValue: "",
                    textValue: ""
                });
            }
        }
    }

    render(): ReactNode {
        return (
            <View style={this.mergedStyle.container}>
                <View style={this.mergedStyle.valueRow}>
                    <TextInput
                        editable={false}
                        style={this.mergedStyle.readonlyText}
                        value={this.state.displayValue}
                        secureTextEntry
                    />
                    {this.renderValidation()}
                </View>
                <View style={this.mergedStyle.buttonRow}>
                    <PinInputButton caption="1" style={this.mergedStyle} onClick={this.onClick} />
                    <PinInputButton caption="2" style={this.mergedStyle} onClick={this.onClick} />
                    <PinInputButton caption="3" style={this.mergedStyle} onClick={this.onClick} />
                </View>
                <View style={this.mergedStyle.buttonRow}>
                    <PinInputButton caption="4" style={this.mergedStyle} onClick={this.onClick} />
                    <PinInputButton caption="5" style={this.mergedStyle} onClick={this.onClick} />
                    <PinInputButton caption="6" style={this.mergedStyle} onClick={this.onClick} />
                </View>
                <View style={this.mergedStyle.buttonRow}>
                    <PinInputButton caption="7" style={this.mergedStyle} onClick={this.onClick} />
                    <PinInputButton caption="8" style={this.mergedStyle} onClick={this.onClick} />
                    <PinInputButton caption="9" style={this.mergedStyle} onClick={this.onClick} />
                </View>
                <View style={this.mergedStyle.buttonRow}>
                    <View style={this.mergedStyle.emptyContainer}></View>
                    <PinInputButton caption="0" style={this.mergedStyle} onClick={this.onClick} />
                    <DeleteButton
                        deleteButtonIcon={this.props.deleteButtonIcon}
                        style={this.mergedStyle}
                        onClick={this.onDeleteClick}
                    />
                </View>
            </View>
        );
    }

    renderValidation(): ReactNode {
        let validation;
        if (this.props.dataAttr.validation) {
            validation = "" + this.props.dataAttr.validation;
        } else {
            validation = " ";
        }
        return <Text style={this.mergedStyle.validationMessage}>{validation}</Text>;
    }

    onClick(value: string): void {
        const { dataAttr, onChangeAction, onInputCompleteAction } = this.props;

        if (!dataAttr || dataAttr.status !== ValueStatus.Available) {
            return;
        }
        // Add input if not at maximum length yet
        let displayValueLength = this.state.textValue.length;
        if (displayValueLength < this.props.maxLength) {
            // Add digit to value
            dataAttr.setTextValue(this.state.textValue + value);
            this.setState(state => ({
                displayValue: state.displayValue + "*",
                textValue: state.textValue + value
            }));
            displayValueLength++;

            // Execute on change action if more input expected,
            // execute on input complete action if all digits were entered.
            if (displayValueLength < this.props.maxLength) {
                if (onChangeAction && onChangeAction.canExecute && !onChangeAction.isExecuting) {
                    onChangeAction.execute();
                }
            } else {
                if (onInputCompleteAction && onInputCompleteAction.canExecute && !onInputCompleteAction.isExecuting) {
                    onInputCompleteAction.execute();
                }
            }
        }
    }

    onDeleteClick(): void {
        const { dataAttr, onChangeAction } = this.props;

        if (!dataAttr || dataAttr.status !== ValueStatus.Available) {
            return;
        }
        if (this.state.textValue.length > 0) {
            this.setState(state => {
                const newValue = state.textValue.substr(0, state.textValue.length - 1);
                const newDisplayValue = state.displayValue.substr(0, state.displayValue.length - 1);
                dataAttr.setTextValue(newValue);

                return {
                    displayValue: newDisplayValue,
                    textValue: newValue
                };
            });
            if (onChangeAction && onChangeAction.canExecute && !onChangeAction.isExecuting) {
                onChangeAction.execute();
            }
        }
    }
}
