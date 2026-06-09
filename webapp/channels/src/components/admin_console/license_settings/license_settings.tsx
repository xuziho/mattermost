// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';
import {FormattedMessage, defineMessages} from 'react-intl';

import type {ClientLicense, EnvironmentConfig} from '@mattermost/types/config';
import type {ServerError} from '@mattermost/types/errors';
import type {ServerLimits} from '@mattermost/types/limits';
import type {GetFilteredUsersStatsOpts, UsersStats} from '@mattermost/types/users';

import type {ActionResult} from 'mattermost-redux/types/actions';

import AdminHeader from 'components/widgets/admin_console/admin_header';

import {LicenseSkus, ModalIdentifiers} from 'utils/constants';
import {isTrialLicense, licenseSKUWithFirstLetterCapitalized} from 'utils/license_utils';

import type {ModalData} from 'types/actions';

import EnterpriseEditionLeftPanel, {messages as enterpriseEditionLeftPanelMessages} from './enterprise_edition/enterprise_edition_left_panel';
import EnterpriseEditionRightPanel from './enterprise_edition/enterprise_edition_right_panel';
import ConfirmLicenseRemovalModal from './modals/confirm_license_removal_modal';
import UploadLicenseModal from './modals/upload_license_modal';
import StarterLeftPanel, {messages as licenseSettingsStarterEditionMessages} from './starter_edition/starter_left_panel';
import StarterRightPanel from './starter_edition/starter_right_panel';
import TeamEditionLeftPanel from './team_edition/team_edition_left_panel';
import TeamEditionRightPanel from './team_edition/team_edition_right_panel';
import UserSeatAlertBanner from './user_seat_alert_banner';

import './license_settings.scss';

type Props = {
    license: ClientLicense;
    enterpriseReady: boolean;
    upgradedFromTE: boolean;
    totalUsers: number;
    isDisabled: boolean;
    environmentConfig: Partial<EnvironmentConfig>;
    actions: {
        getLicenseConfig: () => void;
        uploadLicense: (file: File) => Promise<ActionResult>;
        removeLicense: () => Promise<ActionResult<boolean, ServerError>>;
        openModal: <P>(modalData: ModalData<P>) => void;
        getServerLimits: () => Promise<ActionResult<ServerLimits, ServerError>>;
        getFilteredUsersStats: (filters: GetFilteredUsersStatsOpts) => Promise<{
            data?: UsersStats;
            error?: ServerError;
        }>;
    };
}

const messages = defineMessages({
    title: {id: 'admin.license.title', defaultMessage: 'Edition and License'},
});

export const searchableStrings = [
    licenseSettingsStarterEditionMessages.key,
    enterpriseEditionLeftPanelMessages.keyRemove,
    messages.title,
];

type State = {
    fileSelected: boolean;
    file: File | null;
    serverError: string | null;
    removing: boolean;
};
export default class LicenseSettings extends React.PureComponent<Props, State> {
    private fileInputRef: React.RefObject<HTMLInputElement>;
    constructor(props: Props) {
        super(props);

        this.state = {
            fileSelected: false,
            file: null,
            serverError: null,
            removing: false,
        };
        this.fileInputRef = React.createRef();
    }

    componentDidMount() {
        this.props.actions.getLicenseConfig();
        this.props.actions.getFilteredUsersStats({include_bots: false, include_deleted: false});
        this.props.actions.getServerLimits();
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        if (prevState.fileSelected !== this.state.fileSelected && this.state.fileSelected) {
            this.props.actions.openModal({
                modalId: ModalIdentifiers.UPLOAD_LICENSE,
                dialogType: UploadLicenseModal,
                dialogProps: {
                    fileObjFromProps: this.state.file,
                },
            });
        }
        this.setState({fileSelected: false, file: null});
    }

    handleChange = () => {
        const element = this.fileInputRef.current;
        if (element?.files?.length) {
            this.setState({fileSelected: true, file: element.files[0]});
        }
    };

    confirmLicenseRemoval = async () => {
        this.props.actions.openModal({
            modalId: ModalIdentifiers.CONFIRM_LICENSE_REMOVAL,
            dialogType: ConfirmLicenseRemovalModal,
            dialogProps: {handleRemove: this.handleRemove, currentLicenseSKU: licenseSKUWithFirstLetterCapitalized(this.props.license)},
        });
    };

    handleRemove = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        this.setState({removing: true});

        const {error} = await this.props.actions.removeLicense();
        if (error) {
            this.setState({serverError: error.message, removing: false});
            return;
        }

        await this.props.actions.getLicenseConfig();

        await this.props.actions.getServerLimits();

        this.setState({serverError: null, removing: false});
    };

    currentPlan = (
        <div className='current-plan-legend'>
            <i className='icon-check-circle'/>
            {'Current Plan'}
        </div>
    );

    render() {
        const {license, upgradedFromTE, isDisabled} = this.props;

        let leftPanel = null;
        let rightPanel = null;

        if (!this.props.enterpriseReady) { // Team Edition
            // Note: DO NOT LOCALISE THESE STRINGS. Legally we can not since the license is in English.
            leftPanel = (
                <TeamEditionLeftPanel/>
            );

            rightPanel = <TeamEditionRightPanel/>;
        } else if (license.IsLicensed === 'true') {
            // Note: DO NOT LOCALISE THESE STRINGS. Legally we can not since the license is in English.
            leftPanel = (
                <EnterpriseEditionLeftPanel
                    license={license}
                    isTrialLicense={isTrialLicense(license)}
                    handleRemove={this.confirmLicenseRemoval}
                    isDisabled={isDisabled}
                    removing={this.state.removing}
                    fileInputRef={this.fileInputRef}
                    handleChange={this.handleChange}
                    statsActiveUsers={this.props.totalUsers || 0}
                    isLicenseSetByEnvVar={Boolean(this.props.environmentConfig?.ServiceSettings?.LicenseFileLocation)}
                />
            );

            rightPanel = (
                <EnterpriseEditionRightPanel
                    isTrialLicense={isTrialLicense(license)}
                    license={license}
                />
            );
        } else {
            // Note: DO NOT LOCALISE THESE STRINGS. Legally we can not since the license is in English.
            // This is Mattermost Starter (Already downloaded the binary but no license has been set, or ended the trial period)
            leftPanel = (
                <StarterLeftPanel
                    currentPlan={this.currentPlan}
                    fileInputRef={this.fileInputRef}
                    handleChange={this.handleChange}
                />
            );

            rightPanel = (
                <StarterRightPanel/>
            );
        }

        return (
            <div className='wrapper--fixed'>
                <AdminHeader>
                    <FormattedMessage {...messages.title}/>
                </AdminHeader>
                <div className='admin-console__wrapper'>
                    <div className='admin-console__content'>
                        <div className='admin-console__banner_section'>
                            <UserSeatAlertBanner
                                license={license}
                                totalUsers={this.props.totalUsers}
                                location='license_settings'
                            />
                        </div>
                        <div className='top-wrapper'>
                            <div className='left-panel'>
                                <div className='panel-card'>
                                    {leftPanel}
                                </div>
                            </div>
                            <div className='right-panel'>
                                <div className={classNames('panel-card', {entry: license.SkuShortName === LicenseSkus.Entry})}>
                                    {rightPanel}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}
