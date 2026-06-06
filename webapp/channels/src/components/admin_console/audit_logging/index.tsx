// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useIntl} from 'react-intl';

import {removeAuditCertificate, uploadAuditCertificate} from 'actions/admin_actions';

import FileUploadSetting from '../file_upload_setting';
import RemoveFileSetting from '../remove_file_setting';

type Props = {
    id?: string;
    value: any;
    onChange: (id: string, value: string) => void;
    disabled: boolean;
    setByEnv: boolean;
    label: string;
    helpText: React.JSX.Element;
};

const AuditLoggingCertificateUploadSetting: React.FC<Props> = (props: Props) => {
    const {
        id,
        onChange,
        disabled,
        setByEnv,
        label,
        helpText,
        value,
    } = props;

    const {formatMessage} = useIntl();

    const [fileValue, setFileValue] = React.useState<string | null>(value || null); // State for the file name
    const [fileError, setFileError] = React.useState<string | null>(null); //State for file error

    React.useEffect(() => {
        if (value) {
            setFileValue(value);
        }
    }, [value]);

    if (!id) {
        return (<></>);
    }

    const handleChange = (id: string, value: string) => {
        onChange(id, value);
    };

    const removeAction = (successCallback: () => void, errorCallback: (error: any) => void) => {
        removeAuditCertificate(successCallback, errorCallback);
    };

    const uploadAction = (file: File, successCallback: (filename: string) => void, errorCallback: (error: any) => void) => {
        uploadAuditCertificate(file, successCallback, errorCallback);
    };

    if (fileValue) {
        const removeFile = (id: string, callback: () => void) => {
            const successCallback = () => {
                handleChange(id, '');
                setFileValue(null);
                setFileError(null);
            };
            const errorCallback = (error: any) => {
                callback();
                setFileValue(null);
                setFileError(error.message);
            };
            removeAction(successCallback, errorCallback);
        };
        return (
            <RemoveFileSetting
                id={id}
                label={label}
                helpText={formatMessage({id: 'admin.audit_logging_experimental.certificate.remove_help_text', defaultMessage: 'Remove the certificate used for audit logging encryption.'})}
                removeButtonText={formatMessage({id: 'admin.audit_logging_experimental.certificate.remove_button', defaultMessage: 'Remove Certificate'})}
                removingText={formatMessage({id: 'admin.audit_logging_experimental.certificate.removing', defaultMessage: 'Removing Certificate...'})}
                fileName={fileValue}
                onSubmit={removeFile}
                disabled={disabled}
                setByEnv={setByEnv}
            />
        );
    }

    const uploadFile = (id: string, file: File, callback: (error?: string) => void) => {
        const successCallback = (filename: string) => {
            handleChange(id, filename);
            setFileValue(filename);
            setFileError(null);
            if (callback && typeof callback === 'function') {
                callback();
            }
        };
        const errorCallback = (error: any) => {
            if (callback && typeof callback === 'function') {
                callback(error.message);
            }
        };
        uploadAction(file, successCallback, errorCallback);
    };

    return (
        <FileUploadSetting
            id={id}
            label={label}
            helpText={helpText}
            uploadingText={formatMessage({id: 'admin.audit_logging_experimental.certificate.uploading', defaultMessage: 'Uploading Certificate...'})}
            disabled={disabled}
            fileType={'.crt,.cer,.cert,.pem'}
            onSubmit={uploadFile}
            error={fileError || undefined} //now passes local error state
        />
    );
};

export default AuditLoggingCertificateUploadSetting;
