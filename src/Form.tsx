import React, { ChangeEvent, FormEvent, useState } from 'react';

const FormContext = React.createContext(undefined);
FormContext.displayName = 'Zeno-Form-Context';

const FormProvider = FormContext.Provider;
const FormConsumer = FormContext.Consumer;

export type Touched<T> = Record<keyof T, boolean>;
export type Required<T> = Record<keyof T, boolean>;
export type Errors<T> = Record<keyof T, string | undefined>;
export type ValidationResult<T> = {errors: Errors<T>, required: Touched<T>};
export type Validate<T> = (values: T, touched: Touched<T>, required: Touched<T>, reason: FormValidationReason) => ValidationResult<T>;
export enum FormValidationReason {
    Initializing = 'Initializing',
    ValueChange = 'ValueChange',
    Submitting = 'Submitting'
}

interface FormProps<T> {
    initialValues: T
    required?: Required<T>
    validator: Validate<T>
    handleSubmit: (values: T) => Promise<boolean>
    afterSubmit: (success: boolean) => void
    children: (
        isSubmitting: boolean,
        invalidRequired: boolean,
        values: T, 
        touched: Touched<T>,
        errors: Errors<T>,
    ) => React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>
}

interface BaseFormProps {
    children: JSX.Element | JSX.Element[]
}
interface BaseInputProps {
    type: string
    name: string
    label?: string
    disabled?: boolean
}
interface BaseErrorMessageProps {
    name: string
}

function cloneWithDefaultValues<T, U> (input: T, defaultValue: U): Record<keyof T, U> {
    return Object
    .keys(input)
    .reduce(
        (clone, key) => ({ [key]: defaultValue, ...clone }),
        {} as Record<keyof T, U>
    );
}


export default function Form<T>(props: FormProps<T>): JSX.Element {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [touched, setTouched] = useState<Touched<T>>(cloneWithDefaultValues(props.initialValues, false));
    const [required, setRequired] = useState<Touched<T>>(props.required ||  props.validator(props.initialValues, touched, cloneWithDefaultValues(props.initialValues, false), FormValidationReason.ValueChange).required);
    const [errors, setErrors] = useState<Errors<T>>(cloneWithDefaultValues(props.initialValues, undefined));
    const [formData, setFormData] = useState(props.initialValues);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const newFormData = {
            ...formData,
            [event.target.name]: event.target.value
        };
        setFormData(newFormData);
        setTouched({
            ...touched,
            [event.target.name]: true
        });
        const validationResult = props.validator(newFormData, touched, required, FormValidationReason.ValueChange);
        setErrors(validationResult.errors);
        setRequired(validationResult.required);
    };

    const formSubmit = async (event: FormEvent<HTMLElement>) => {
        event.preventDefault();
        const validationResult = props.validator(formData, touched, required, FormValidationReason.Submitting);
        setErrors(validationResult.errors);
        setRequired(validationResult.required);
        for (const key in validationResult.errors) {
            if (validationResult.errors[key]) {
                return;
            }
        }
        
        setIsSubmitting(true);
        const result = await props.handleSubmit(formData);
        setIsSubmitting(false);
        return result;
    };
    
    let invalidRequired = false;

    for (const key in required) {
        if (required[key] && !formData[key]) {
            invalidRequired = true;
        }
    }

    return (
        <FormProvider value={{formData, touched, errors, handleChange, formSubmitHandle: (event: FormEvent<HTMLElement>) => formSubmit(event).then(props.afterSubmit)}}>
            {props.children(isSubmitting, invalidRequired, formData, touched, errors)}
        </FormProvider>
    );
}


export const BaseErrorMessage = (props: BaseErrorMessageProps): JSX.Element => {
    return (
        <FormConsumer>
            {
                ({touched, errors}) => {
                    return (
                        <div data-testid={`zeno-form-error-message-${props.name}`}>
                            {touched[props.name] && errors[props.name]}
                        </div>
                    );
                }
            }
        </FormConsumer>
    );
};

export const BaseForm = (props: BaseFormProps): JSX.Element => {
    return (
        <FormConsumer>
            {
                ({formSubmitHandle}) =>
                <form data-testid='zeno-form' onSubmit={formSubmitHandle}>
                    {props.children}
                </form>
            }
        </FormConsumer>
    );
};

export const BaseInput = (props: BaseInputProps): JSX.Element => {
    return (
        <FormConsumer>            
            {({formData, handleChange}) => {    
                const value = props.type === 'submit'
                    ? props.label
                    : formData[props.name];            
                return (
                    <React.Fragment>
                        {props.label && props.type !== 'submit' && <label data-testid={`zeno-form-label-${props.name}`} htmlFor={props.name}>{props.label}</label>}
                        <input data-testid={`zeno-form-input-${props.name}`} type={props.type} name={props.name} disabled={props.disabled || false} value={value} onChange={handleChange} />
                    </React.Fragment>
                );
            }}
        </FormConsumer>
    );
};