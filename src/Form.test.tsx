import React from 'react';
import { act, fireEvent, render } from '@testing-library/react';
import Form, { BaseErrorMessage, BaseForm, BaseInput, Validate, Required } from './Form';

interface FormData {
    username: string
    password: string
}

interface FormProps {
    validate: Validate<FormData>
    initialData: FormData
    required?: Required<FormData>
    handleSubmit?: (values: FormData) => Promise<void>
}

const FormComponent = (props: FormProps): JSX.Element => {
    return (
        <Form<FormData>
            initialValues={props.initialData}
            required={props.required}
            validator={props.validate}
            handleSubmit={props.handleSubmit}>
            {(isSubmitting, invalidRequired) =>
            <BaseForm>
                <BaseInput type="text" name="username" disabled={isSubmitting} label="Username" />
                <BaseErrorMessage name="username" />
                <BaseInput type="password" name="password" disabled={isSubmitting} label="Password" />
                <BaseErrorMessage name="password" />
                <BaseInput type="submit" name="submit" label="Login" disabled={isSubmitting || invalidRequired}/>
                {invalidRequired && <div data-testid='invalid-required-div' />}
            </BaseForm>
            }
        </Form>
    );
};

describe('Form', () => {
    const initialData: FormData = {
        username: 'mark',
        password: 'markpass'
    };
    const required: Required<FormData> = {
        username: false,
        password: false
    };

    test('created with initial required values does not invoke the validator', () => {
        const validator = jest.fn();
        render(<FormComponent validate={validator} initialData={initialData} required={required} />);
        expect(validator).toHaveBeenCalledTimes(0);
    });

    test('created without initial required values invokes the validator', () => {
        const validator = jest.fn();
    
        validator.mockReturnValue({
            errors: {
                username: '',
                password: ''
            },
            required: required
        });
        render(<FormComponent validate={validator} initialData={initialData} />);
        expect(validator).toHaveBeenCalledTimes(1);
    });

    test('fields where required but have not been touched are not required', () => {
        const validator = jest.fn();    
        validator.mockReturnValue({
            errors: {
                username: '',
                password: ''
            },
            required: {
                username: true,
                password: true
            }
        });
        const {
            queryByTestId
        } = render(<FormComponent validate={validator} initialData={initialData} />);
                
        const invalidRequiredDiv = queryByTestId('invalid-required-div');
        expect(invalidRequiredDiv).toBeNull();
    });

    test('fields where required and have been touched are required', () => {
        const validator = jest.fn();    
        validator.mockReturnValue({
            errors: {
                username: '',
                password: ''
            },
            required: {
                username: true,
                password: true
            }
        });
        const {
            getByTestId
        } = render(<FormComponent validate={validator} initialData={initialData} />);
        
        let usernameElement = getByTestId('zeno-form-input-username') as HTMLInputElement;
        fireEvent.change(usernameElement, { target: { value: '1' } });
        usernameElement = getByTestId('zeno-form-input-username') as HTMLInputElement;
        fireEvent.change(usernameElement, { target: { value: '' } });
        
        const invalidRequiredDiv = getByTestId('invalid-required-div');
        expect(invalidRequiredDiv).toBeDefined();
    });

    test('when submitted invokes submit callback', async () => {
        const validator = jest.fn();    
        validator.mockReturnValue({
            errors: {
                username: '',
                password: ''
            },
            required: {
                username: true,
                password: true
            }
        });
        const handleSubmit = jest.fn();        
        const {
            getByTestId
        } = render(<FormComponent validate={validator} initialData={initialData} handleSubmit={handleSubmit} />);
        
        let usernameElement = getByTestId('zeno-form-input-username') as HTMLInputElement;
        fireEvent.change(usernameElement, { target: { value: 'username' } });
        usernameElement = getByTestId('zeno-form-input-password') as HTMLInputElement;
        fireEvent.change(usernameElement, { target: { value: 'password' } });
        
        const submitElement = getByTestId('zeno-form-input-submit') as HTMLInputElement;

        await act(async () => {
            fireEvent.submit(submitElement);
        });

        expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    test('when submitted with error does not invoke submit', async () => {
        const validator = jest.fn();    
        validator.mockReturnValue({
            errors: {
                username: 'ERROR',
                password: ''
            },
            required: {
                username: true,
                password: true
            }
        });
        const handleSubmit = jest.fn();        
        const {
            getByTestId
        } = render(<FormComponent validate={validator} initialData={initialData} handleSubmit={handleSubmit} />);
        
        let usernameElement = getByTestId('zeno-form-input-username') as HTMLInputElement;
        fireEvent.change(usernameElement, { target: { value: 'username' } });
        usernameElement = getByTestId('zeno-form-input-password') as HTMLInputElement;
        fireEvent.change(usernameElement, { target: { value: 'password' } });
        
        const submitElement = getByTestId('zeno-form-input-submit') as HTMLInputElement;

        await act(async () => {
            fireEvent.submit(submitElement);
        });

        expect(handleSubmit).toHaveBeenCalledTimes(0);
    });
});