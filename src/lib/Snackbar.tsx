import React, { createContext, useEffect, useReducer } from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';

function Alert(props: AlertProps) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export type snackbarOption = {
    severity?: 'success' | 'info' | 'warning' | 'error';
    measage?: string;
};

export type snackbarAction = { type: SnackbarType; option?: snackbarOption };

export enum SnackbarType {
    CLOSE,
    OPEN,
}

const initialState: snackbarOption = {};

const reducer = (state: snackbarOption, action: snackbarAction) => {
    switch (action.type) {
        case SnackbarType.OPEN:
            let severity = action.option?.severity;
            if (!severity) {
                severity = 'info';
            }
            return { ...action.option, severity };
        case SnackbarType.CLOSE:
            return { ...state, measage: undefined };
        default:
            return state;
    }
};

export const snackbarContext = createContext<
    React.Dispatch<snackbarAction> | undefined
>(undefined);

const GlobalSnackbar: React.FC<{
    children: React.ReactNode;
}> = ({ children }): JSX.Element => {
    const [state, dispatch] = useReducer<snackbarOption, snackbarAction>(
        reducer,
        initialState,
    );
    const [open, setOpen] = React.useState(false);

    useEffect(() => {
        const { measage } = state;
        if (measage) {
            setOpen(true);
        }
    }, [state]);

    const handleClose = (_event?: React.SyntheticEvent, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
        dispatch({
            type: SnackbarType.CLOSE,
            option: {},
        });
    };

    return (
        <snackbarContext.Provider value={dispatch}>
            {children}
            <Snackbar open={open} autoHideDuration={5000} onClose={handleClose}>
                <Alert onClose={handleClose} severity={state.severity}>
                    {state.measage}
                </Alert>
            </Snackbar>
        </snackbarContext.Provider>
    );
};

export default GlobalSnackbar;
