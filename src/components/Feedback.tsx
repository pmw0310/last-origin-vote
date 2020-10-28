import React, { createContext, useEffect, useReducer, useContext } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Snackbar,
} from '@material-ui/core';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';

function Alert(props: AlertProps) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export type snackbarOption = {
    severity?: 'success' | 'info' | 'warning' | 'error';
    measage?: string;
};
export type dialogOption = {
    title: string;
    contentText?: string;
    noButtonText: string;
    yesButtonText: string;
    onClose?: (event?: React.MouseEvent<HTMLElement>) => void;
    onAgree: (event?: React.MouseEvent<HTMLElement>) => void;
};

export type snackbarAction = { type: FeedbackType; option?: snackbarOption };
export type dialogAction = { type: FeedbackType; option?: dialogOption };

export enum FeedbackType {
    CLOSE,
    OPEN,
}

const snackbarInitialState: snackbarOption = {};
const dialogInitialState: dialogOption = {
    title: '',
    noButtonText: '',
    yesButtonText: '',
    onAgree: () => undefined,
};

const snackbarReducer = (
    state: snackbarOption,
    action: snackbarAction,
): snackbarOption => {
    switch (action.type) {
        case FeedbackType.OPEN:
            let severity = action.option?.severity;
            if (!severity) {
                severity = 'info';
            }
            return { ...action.option, severity };
        case FeedbackType.CLOSE:
            return { ...state, measage: undefined };
        default:
            return state;
    }
};
const dialogReducer = (
    state: dialogOption,
    action: dialogAction,
): dialogOption => {
    switch (action.type) {
        case FeedbackType.OPEN:
            return { ...(action.option as dialogOption) };
        case FeedbackType.CLOSE:
            return {
                title: '',
                noButtonText: '',
                yesButtonText: '',
                onAgree: () => undefined,
            };
        default:
            return state;
    }
};

const snackbarContext = createContext<React.Dispatch<snackbarAction> | null>(
    null,
);
const dialogContext = createContext<React.Dispatch<dialogAction> | null>(null);

const GlobalFeedback: React.FC<{
    children: React.ReactNode;
}> = ({ children }): JSX.Element => {
    const [snackbarState, snackbarDispatch] = useReducer<
        snackbarOption,
        snackbarAction
    >(snackbarReducer, snackbarInitialState);
    const [dialogState, dialogDispatch] = useReducer<
        dialogOption,
        dialogAction
    >(dialogReducer, dialogInitialState);

    const [snackbarOpen, setSnackbarOpen] = React.useState<boolean>(false);
    const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);

    useEffect(() => {
        const { measage } = snackbarState;
        if (measage) {
            setSnackbarOpen(true);
        }
    }, [snackbarState]);

    useEffect(() => {
        const { title, noButtonText, yesButtonText } = dialogState;
        if (title && noButtonText && yesButtonText) {
            setDialogOpen(true);
        }
    }, [dialogState]);

    const handleSnackbarClose = (
        _event?: React.SyntheticEvent,
        reason?: string,
    ) => {
        if (reason === 'clickaway') {
            return;
        }

        setSnackbarOpen(false);
        snackbarDispatch({
            type: FeedbackType.CLOSE,
            option: {},
        });
    };
    const handleDialogClose = () => {
        setDialogOpen(false);
        dialogDispatch({
            type: FeedbackType.CLOSE,
            option: {
                title: '',
                noButtonText: '',
                yesButtonText: '',
                onClose: () => undefined,
                onAgree: () => undefined,
            },
        });
    };
    const handleOnDialogClose = (event: React.MouseEvent<HTMLElement>) => {
        handleDialogClose();
        if (dialogState.onClose) {
            dialogState.onClose(event);
        }
    };
    const handleOnDialogAgree = (event: React.MouseEvent<HTMLElement>) => {
        handleDialogClose();
        dialogState.onAgree(event);
    };

    return (
        <dialogContext.Provider value={dialogDispatch}>
            <snackbarContext.Provider value={snackbarDispatch}>
                {children}
                <Dialog
                    open={dialogOpen}
                    onClose={handleOnDialogClose}
                    aria-labelledby="dialog-title"
                    aria-describedby="dialog-description"
                >
                    <DialogTitle id="dialog-title">
                        {dialogState.title}
                    </DialogTitle>
                    {dialogState.contentText && (
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                {dialogState.contentText}
                            </DialogContentText>
                        </DialogContent>
                    )}
                    <DialogActions>
                        <Button onClick={handleOnDialogClose} color="secondary">
                            {dialogState.noButtonText}
                        </Button>
                        <Button
                            onClick={handleOnDialogAgree}
                            color="primary"
                            autoFocus
                        >
                            {dialogState.yesButtonText}
                        </Button>
                    </DialogActions>
                </Dialog>
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={5000}
                    onClose={handleSnackbarClose}
                >
                    <Alert
                        onClose={handleSnackbarClose}
                        severity={snackbarState.severity}
                    >
                        {snackbarState.measage}
                    </Alert>
                </Snackbar>
            </snackbarContext.Provider>
        </dialogContext.Provider>
    );
};

export default React.memo(GlobalFeedback);

export function useSnackbarState(): React.Dispatch<snackbarAction> {
    const state = useContext(snackbarContext);
    if (!state) throw new Error('Cannot find snackbarContext');
    return state;
}
export function useDialogState(): React.Dispatch<dialogAction> {
    const state = useContext(dialogContext);
    if (!state) throw new Error('Cannot find snackbarContext');
    return state;
}
