// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage, defineMessages} from 'react-intl';

import type {AnalyticsRow, AnalyticsState} from '@mattermost/types/admin';
import type {ClientConfig, ClientLicense} from '@mattermost/types/config';
import type {ServerLimits} from '@mattermost/types/limits';

import {getFormattedFileSize} from 'mattermost-redux/utils/file_utils';

import * as AdminActions from 'actions/admin_actions.jsx';

import UserSeatAlertBanner from 'components/admin_console/license_settings/user_seat_alert_banner';
import ActivatedUserCard from 'components/analytics/activated_users_card';
import SingleChannelGuestsCard from 'components/analytics/single_channel_guests_card';
import ExternalLink from 'components/external_link';
import AdminHeader from 'components/widgets/admin_console/admin_header';

import Constants, {LicenseSkus} from 'utils/constants';

import './analytics.scss';

import type {GlobalState} from 'types/store';

import DoughnutChart from '../doughnut_chart';
import {
    formatPostsPerDayData,
    formatUsersWithPostsPerDayData,
    formatChannelDoughtnutData,
    synchronizeChartLabels,
} from '../format';
import LineChart from '../line_chart';
import StatisticCount from '../statistic_count';

const StatTypes = Constants.StatTypes;

type Props = {
    isLicensed: boolean;
    stats?: AnalyticsState;
    license: ClientLicense;
    config?: Partial<ClientConfig>;
    serverLimits: ServerLimits;
}

type State = {
    lineChartsDataLoaded: boolean;
}

const messages = defineMessages({
    title: {id: 'analytics.system.title', defaultMessage: 'System Statistics'},
    totalPosts: {id: 'analytics.system.totalPosts', defaultMessage: 'Total Posts'},
    activeUsers: {id: 'analytics.system.activeUsers', defaultMessage: 'Active Users With Posts'},
    totalSessions: {id: 'analytics.system.totalSessions', defaultMessage: 'Total Sessions'},
    totalCommands: {id: 'analytics.system.totalCommands', defaultMessage: 'Total Commands'},
    totalIncomingWebhooks: {id: 'analytics.system.totalIncomingWebhooks', defaultMessage: 'Incoming Webhooks'},
    totalOutgoingWebhooks: {id: 'analytics.system.totalOutgoingWebhooks', defaultMessage: 'Outgoing Webhooks'},
    totalWebsockets: {id: 'analytics.system.totalWebsockets', defaultMessage: 'WebSocket Conns'},
    totalMasterDbConnections: {id: 'analytics.system.totalMasterDbConnections', defaultMessage: 'Master DB Conns'},
    totalReadDbConnections: {id: 'analytics.system.totalReadDbConnections', defaultMessage: 'Replica DB Conns'},
    postTypes: {id: 'analytics.system.postTypes', defaultMessage: 'Posts, Files and Hashtags'},
    channelTypes: {id: 'analytics.system.channelTypes', defaultMessage: 'Channel Types'},
    totalTeams: {id: 'analytics.system.totalTeams', defaultMessage: 'Total Teams'},
    totalChannels: {id: 'analytics.system.totalChannels', defaultMessage: 'Total Channels'},
    dailyActiveUsers: {id: 'analytics.system.dailyActiveUsers', defaultMessage: 'Daily Active Users'},
    monthlyActiveUsers: {id: 'analytics.system.monthlyActiveUsers', defaultMessage: 'Monthly Active Users'},
    totalFiles: {id: 'analytics.system.totalFiles', defaultMessage: 'Total Files'},
    totalFilesSize: {id: 'analytics.system.totalFilesSize', defaultMessage: 'Total Files Size'},
    singleChannelGuests: {id: 'analytics.system.singleChannelGuests', defaultMessage: 'Single-channel Guests'},
});

export const searchableStrings = [
    messages.title,
    messages.totalPosts,
    messages.activeUsers,
    messages.totalSessions,
    messages.totalCommands,
    messages.totalIncomingWebhooks,
    messages.totalOutgoingWebhooks,
    messages.totalWebsockets,
    messages.totalMasterDbConnections,
    messages.totalReadDbConnections,
    messages.postTypes,
    messages.channelTypes,
    messages.totalTeams,
    messages.totalChannels,
    messages.dailyActiveUsers,
    messages.monthlyActiveUsers,
    messages.totalFiles,
    messages.totalFilesSize,
    messages.singleChannelGuests,
];

export default class SystemAnalytics extends React.PureComponent<Props, State> {
    state = {
        lineChartsDataLoaded: false,
    };

    public async componentDidMount() {
        AdminActions.getStandardAnalytics();
        AdminActions.refreshServerLimits();

        if (this.props.isLicensed) {
            AdminActions.getAdvancedAnalytics();
        }
    }

    private loadLineChartData = async () => {
        await Promise.allSettled([
            AdminActions.getPostsPerDayAnalytics(),
            AdminActions.getBotPostsPerDayAnalytics(),
            AdminActions.getUsersPerDayAnalytics(),
        ]);
        this.setState({lineChartsDataLoaded: true});
    };

    private handleLineChartsToggle = (e: React.MouseEvent<HTMLDetailsElement>) => {
        const details = e.currentTarget;
        const isExpanding = details.open;

        if (isExpanding && !this.state.lineChartsDataLoaded) {
            this.loadLineChartData();
        }
    };

    private getStatValue(stat: number | AnalyticsRow[] | undefined): number | undefined {
        if (typeof stat === 'number') {
            return stat;
        }
        if (!stat || stat.length === 0) {
            return undefined;
        }
        return stat[0].value;
    }

    public render() {
        const stats = this.props.stats!;
        const isLicensed = this.props.isLicensed;
        const skippedIntensiveQueries = stats[StatTypes.TOTAL_POSTS] === -1;

        const labels = synchronizeChartLabels(stats[StatTypes.POST_PER_DAY], stats[StatTypes.BOT_POST_PER_DAY], stats[StatTypes.USERS_WITH_POSTS_PER_DAY]);
        const postCountsDay = formatPostsPerDayData(labels, stats[StatTypes.POST_PER_DAY]);
        const botPostCountsDay = formatPostsPerDayData(labels, stats[StatTypes.BOT_POST_PER_DAY]);
        const userCountsWithPostsDay = formatUsersWithPostsPerDayData(labels, stats[StatTypes.USERS_WITH_POSTS_PER_DAY]);

        let banner;
        let postCount;
        let postTotalGraph;
        let botPostTotalGraph;
        let activeUserGraph;
        if (skippedIntensiveQueries) {
            banner = (
                <div className='banner'>
                    <div className='banner__content'>
                        <FormattedMessage
                            id='analytics.system.skippedIntensiveQueries'
                            defaultMessage='To maximize performance, some statistics are disabled. You can <link>re-enable them in config.json</link>.'
                            values={{
                                link: (msg: React.ReactNode) => (
                                    <ExternalLink
                                        href='#'
                                        location='system_analytics'
                                    >
                                        {msg}
                                    </ExternalLink>
                                ),
                            }}
                        />
                    </div>
                </div>
            );
        } else {
            postCount = (
                <StatisticCount
                    id='totalPosts'
                    title={<FormattedMessage {...messages.totalPosts}/>}
                    icon='fa-comment'
                    count={this.getStatValue(stats[StatTypes.TOTAL_POSTS])}
                />
            );

            botPostTotalGraph = (
                <div className='row'>
                    <LineChart
                        title={
                            <FormattedMessage
                                id='analytics.system.totalBotPosts'
                                defaultMessage='Total Posts from Bots'
                            />
                        }
                        data={botPostCountsDay}
                        id='totalPostsFromBotsLineChart'
                        width={740}
                        height={225}
                    />
                </div>
            );

            postTotalGraph = (
                <div className='row'>
                    <LineChart
                        title={<FormattedMessage {...messages.totalPosts}/>}
                        id='totalPostsLineChart'
                        data={postCountsDay}
                        width={740}
                        height={225}
                    />
                </div>
            );

            activeUserGraph = (
                <div className='row'>
                    <LineChart
                        title={<FormattedMessage {...messages.activeUsers}/>}
                        id='activeUsersWithPostsLineChart'
                        data={userCountsWithPostsDay}
                        width={740}
                        height={225}
                    />
                </div>
            );
        }

        let advancedStats;
        let advancedGraphs;
        let sessionCount;
        let commandCount;
        let incomingCount;
        let outgoingCount;
        let totalFiles;
        let totalFilesSize;
        if (this.props.isLicensed) {
            sessionCount = (
                <StatisticCount
                    id='totalSessions'
                    title={<FormattedMessage {...messages.totalSessions}/>}
                    icon='fa-signal'
                    count={this.getStatValue(stats[StatTypes.TOTAL_SESSIONS])}
                />
            );

            commandCount = (
                <StatisticCount
                    id='totalCommands'
                    title={<FormattedMessage {...messages.totalCommands}/>}
                    icon='fa-terminal'
                    count={this.getStatValue(stats[StatTypes.TOTAL_COMMANDS])}
                />
            );

            incomingCount = (
                <StatisticCount
                    id='incomingWebhooks'
                    title={<FormattedMessage {...messages.totalIncomingWebhooks}/>
                    }
                    icon='fa-arrow-down'
                    count={this.getStatValue(stats[StatTypes.TOTAL_IHOOKS])}
                />
            );

            outgoingCount = (
                <StatisticCount
                    id='outgoingWebhooks'
                    title={<FormattedMessage {...messages.totalOutgoingWebhooks}/>
                    }
                    icon='fa-arrow-up'
                    count={this.getStatValue(stats[StatTypes.TOTAL_OHOOKS])}
                />
            );

            totalFiles = (
                <StatisticCount
                    id='totalFiles'
                    title={<FormattedMessage {...messages.totalFiles}/>}
                    icon='fa-files-o'
                    count={this.getStatValue(stats[StatTypes.TOTAL_FILE_COUNT])}
                />
            );

            totalFilesSize = (
                <StatisticCount
                    id='totalFilesSize'
                    title={<FormattedMessage {...messages.totalFilesSize}/>}
                    icon='fa-files-o'
                    count={this.getStatValue(stats[StatTypes.TOTAL_FILE_SIZE])}
                    formatter={getFormattedFileSize}
                />
            );

            advancedStats = (
                <>
                    <StatisticCount
                        id='websocketConns'
                        title={<FormattedMessage {...messages.totalWebsockets}/>
                        }
                        icon='fa-user'
                        count={this.getStatValue(stats[StatTypes.TOTAL_WEBSOCKET_CONNECTIONS])}
                    />
                    <StatisticCount
                        id='masterDbConns'
                        title={<FormattedMessage {...messages.totalMasterDbConnections}/>
                        }
                        icon='fa-terminal'
                        count={this.getStatValue(stats[StatTypes.TOTAL_MASTER_DB_CONNECTIONS])}
                    />
                    <StatisticCount
                        id='replicaDbConns'
                        title={<FormattedMessage {...messages.totalReadDbConnections}/>
                        }
                        icon='fa-terminal'
                        count={this.getStatValue(stats[StatTypes.TOTAL_READ_DB_CONNECTIONS])}
                    />
                </>
            );

            const channelTypeData = formatChannelDoughtnutData(stats[StatTypes.TOTAL_PUBLIC_CHANNELS], stats[StatTypes.TOTAL_PRIVATE_GROUPS]);

            advancedGraphs = (
                <div className='row'>
                    <DoughnutChart
                        title={<FormattedMessage {...messages.channelTypes}/>
                        }
                        data={channelTypeData}
                        width={300}
                        height={225}
                    />
                </div>
            );
        }

        const guestAccountsEnabled = this.props.config?.EnableGuestAccounts === 'true';
        const seatAdjustedUserCount = this.props.serverLimits?.activeUserCount ?? this.getStatValue(stats[StatTypes.TOTAL_USERS]);
        const userCount = (
            <ActivatedUserCard
                activatedUsers={seatAdjustedUserCount}
                guestAccountsEnabled={guestAccountsEnabled}
            />
        );

        const seatsPurchased = (
            <StatisticCount
                id='seatPurchased'
                title={
                    <FormattedMessage
                        id='analytics.system.seatsPurchased'
                        defaultMessage='Licensed Seats'
                    />
                }
                icon='fa-users'
                count={parseInt(this.props.license.Users, 10)}
            />
        );

        const teamCount = (
            <StatisticCount
                id='totalTeams'
                title={<FormattedMessage {...messages.totalTeams}/>
                }
                icon='fa-users'
                count={this.getStatValue(stats[StatTypes.TOTAL_TEAMS])}
            />
        );
        const totalPublicChannelsCount = this.getStatValue(stats[StatTypes.TOTAL_PUBLIC_CHANNELS]);
        const totalPrivateGroupsCount = this.getStatValue(stats[StatTypes.TOTAL_PRIVATE_GROUPS]);
        const totalChannelCount = () => {
            if (totalPublicChannelsCount && totalPrivateGroupsCount) {
                return totalPublicChannelsCount + totalPrivateGroupsCount;
            } else if (!totalPublicChannelsCount && totalPrivateGroupsCount) {
                return totalPrivateGroupsCount;
            } else if (totalPublicChannelsCount && !totalPrivateGroupsCount) {
                return totalPublicChannelsCount;
            }
            return undefined;
        };
        const channelCount = (
            <StatisticCount
                id='totalChannels'
                title={<FormattedMessage {...messages.totalChannels}/>
                }
                icon='fa-globe'
                count={totalChannelCount()}
            />
        );

        const dailyActiveUsers = (
            <StatisticCount
                id='dailyActiveUsers'
                title={<FormattedMessage {...messages.dailyActiveUsers}/>
                }
                icon='fa-users'
                count={this.getStatValue(stats[StatTypes.DAILY_ACTIVE_USERS])}
            />
        );

        const monthlyActiveUsers = (
            <StatisticCount
                id='monthlyActiveUsers'
                title={<FormattedMessage {...messages.monthlyActiveUsers}/>
                }
                icon='fa-users'
                count={this.getStatValue(stats[StatTypes.MONTHLY_ACTIVE_USERS])}
            />
        );

        const isEntrySku = this.props.license.SkuShortName === LicenseSkus.Entry;
        const shouldShowSingleChannelGuests = isLicensed && !isEntrySku && guestAccountsEnabled;

        const singleChannelGuestsCount = this.getStatValue(stats[StatTypes.SINGLE_CHANNEL_GUESTS]);
        const singleChannelGuestLimit = this.props.serverLimits?.singleChannelGuestLimit ?? parseInt(this.props.license.Users, 10);

        const singleChannelGuests = shouldShowSingleChannelGuests ? (
            <SingleChannelGuestsCard
                singleChannelGuestsCount={singleChannelGuestsCount}
                singleChannelGuestLimit={singleChannelGuestLimit}
            />
        ) : null;

        let systemCards;
        if (isLicensed) {
            systemCards = (
                <>
                    {userCount}
                    {seatsPurchased}
                    {singleChannelGuests}
                    {teamCount}
                    {channelCount}
                    {skippedIntensiveQueries ? null : postCount}
                    {sessionCount}
                    {commandCount}
                    {incomingCount}
                    {outgoingCount}
                    {totalFiles}
                    {totalFilesSize}
                </>
            );
        } else if (!isLicensed) {
            systemCards = (
                <>
                    {userCount}
                    {teamCount}
                    {channelCount}
                    {skippedIntensiveQueries ? null : postCount}
                </>
            );
        }

        return (
            <div className='wrapper--fixed team_statistics'>
                <AdminHeader>
                    <FormattedMessage {...messages.title}/>
                </AdminHeader>
                <div className='admin-console__wrapper'>
                    <div className='admin-console__content'>
                        <UserSeatAlertBanner
                            license={this.props.license}
                            totalUsers={this.props.serverLimits?.activeUserCount ?? this.getStatValue(stats[StatTypes.TOTAL_USERS]) ?? 0}
                            location='system_statistics'
                        />
                        {banner}
                        <div className='grid-statistics'>
                            {systemCards}
                            {dailyActiveUsers}
                            {monthlyActiveUsers}
                            {advancedStats}
                        </div>
                        {advancedGraphs}
                        <details
                            onToggle={this.handleLineChartsToggle}
                            data-testid='details-expander'
                        >
                            <summary>
                                <FormattedMessage
                                    id='analytics.system.perDayStatistics'
                                    defaultMessage='Load Advanced Statistics'
                                />
                            </summary>
                            <>
                                {postTotalGraph}
                                {botPostTotalGraph}
                                {activeUserGraph}
                            </>
                        </details>
                    </div>
                </div>
            </div>
        );
    }
}
