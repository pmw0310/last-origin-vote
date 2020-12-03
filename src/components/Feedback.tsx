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
import { atom, useRecoilState } from 'recoil';

import React from 'react';

function Alert(props: AlertProps) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export enum FeedbackStateType {
    CLOSE,
    OPEN,
}

export type snackbarOption = {
    state: FeedbackStateType;
    severity?: 'success' | 'info' | 'warning' | 'error';
    measage?: string;
};
export type dialogOption = {
    state: FeedbackStateType;
    title: string;
    contentText?: string;
    noButtonText: string;
    yesButtonText: string;
    onClose?: (event?: React.MouseEvent<HTMLElement>) => void;
    onAgree: (event?: React.MouseEvent<HTMLElement>) => void;
};

const snackbarAtomDefault: snackbarOption = {
    state: FeedbackStateType.CLOSE,
};

const dialogAtomDefault: dialogOption = {
    state: FeedbackStateType.CLOSE,
    title: '',
    noButtonText: '',
    yesButtonText: '',
    onAgree: () => undefined,
};

export const snackbarAtom = atom<snackbarOption>({
    key: 'feedback/snackbar',
    default: snackbarAtomDefault,
});
export const dialogAtom = atom<dialogOption>({
    key: 'feedback/dialog',
    default: dialogAtomDefault,
});

const GlobalFeedback: React.FC<{
    children: React.ReactNode;
}> = ({ children }): JSX.Element => {
    const [snackbar, setSnackbar] = useRecoilState(snackbarAtom);
    const [dialog, setDialog] = useRecoilState(dialogAtom);

    const handleSnackbarClose = (
        _event?: React.SyntheticEvent,
        reason?: string,
    ) => {
        if (reason === 'clickaway') {
            return;
        }

        setSnackbar({ ...snackbarAtomDefault, severity: snackbar.severity });
    };
    const handleDialogClose = () => {
        setDialog(dialogAtomDefault);
    };
    const handleOnDialogClose = (event: React.MouseEvent<HTMLElement>) => {
        handleDialogClose();
        if (dialog.onClose) {
            dialog.onClose(event);
        }
    };
    const handleOnDialogAgree = (event: React.MouseEvent<HTMLElement>) => {
        handleDialogClose();
        dialog.onAgree(event);
    };

    return (
        <>
            {children}
            <Dialog
                open={dialog.state === FeedbackStateType.OPEN}
                onClose={handleOnDialogClose}
                aria-labelledby="dialog-title"
                aria-describedby="dialog-description"
            >
                <DialogTitle id="dialog-title">{dialog.title}</DialogTitle>
                {dialog.contentText && (
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            {dialog.contentText}
                        </DialogContentText>
                    </DialogContent>
                )}
                <DialogActions>
                    <Button onClick={handleOnDialogClose} color="secondary">
                        {dialog.noButtonText}
                    </Button>
                    <Button
                        onClick={handleOnDialogAgree}
                        color="primary"
                        autoFocus
                    >
                        {dialog.yesButtonText}
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={snackbar.state === FeedbackStateType.OPEN}
                autoHideDuration={5000}
                onClose={handleSnackbarClose}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbar.severity}
                >
                    {snackbar.measage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default React.memo(GlobalFeedback);
