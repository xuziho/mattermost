// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {ChangeEvent} from 'react';
import React, {memo, useEffect, useRef, Fragment, useMemo, useCallback} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import type {OnChangeValue} from 'react-select';
import ReactSelect from 'react-select';

import type {UserNotifyProps} from '@mattermost/types/users';

import SettingItemMax from 'components/setting_item_max';
import SettingItemMin from 'components/setting_item_min';
import type SettingItemMinComponent from 'components/setting_item_min';
import {getOptionLabel, type SelectOption} from 'components/widgets/modals/components/react_select_item';

import {UserSettingsNotificationSections} from 'utils/constants';
import {
	notificationSoundKeys,
	stopTryNotificationRing,
	tryNotificationSound,
	getValueOfNotificationSoundsSelect,
	optionsOfMessageNotificationSoundsSelect,
} from 'utils/notification_sounds';

export type Props = {
	active: boolean;
	updateSection: (section: string) => void;
    onSubmit: () => void;
    onCancel: () => void;
    saving: boolean;
    error: string;
    setParentState: (key: string, value: string | boolean) => void;
	areAllSectionsInactive: boolean;
	desktopSound: UserNotifyProps['desktop_sound'];
	desktopNotificationSound: UserNotifyProps['desktop_notification_sound'];
};

function DesktopNotificationSoundsSettings({
    active,
    updateSection,
    onSubmit,
    onCancel,
    saving,
    error,
    setParentState,
	areAllSectionsInactive,
	desktopSound,
	desktopNotificationSound,
}: Props) {
    const intl = useIntl();

    const editButtonRef = useRef<SettingItemMinComponent>(null);
    const previousActiveRef = useRef(active);

    // Focus back on the edit button, after this section was closed after it was opened
    useEffect(() => {
        if (previousActiveRef.current && !active && areAllSectionsInactive) {
            editButtonRef.current?.focus();
        }

        previousActiveRef.current = active;
    }, [active, areAllSectionsInactive]);

    const handleChangeForMessageNotificationSoundCheckbox = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.checked ? 'true' : 'false';
        setParentState('desktopSound', value);

        if (value === 'false') {
            stopTryNotificationRing();
        }
    }, [setParentState]);

	const handleChangeForMessageNotificationSoundSelect = useCallback((selectedOption: OnChangeValue<SelectOption, boolean>) => {
		stopTryNotificationRing();

        if (selectedOption && 'value' in selectedOption) {
            setParentState('desktopNotificationSound', selectedOption.value);
            tryNotificationSound(selectedOption.value);
        }
    }, [setParentState]);

	const maximizedSettingInputs = useMemo(() => {
		const maximizedSettingInputs = [];

        const isMessageNotificationSoundChecked = desktopSound === 'true';
        const messageSoundSection = (
            <Fragment key='messageSoundSection'>
                <div className='checkbox inlineCheckboxSelect'>
                    <label>
                        <input
                            type='checkbox'
                            checked={desktopSound === 'true'}
                            onChange={handleChangeForMessageNotificationSoundCheckbox}
                        />
                        <span id='messageNotificationSoundLabel'>
                            <FormattedMessage
                                id='user.settings.notifications.desktopNotificationSound.messageNotificationSound'
                                defaultMessage='Message notification sound'
                            />
                        </span>
                    </label>
                    <ReactSelect
                        id='messageNotificationSoundSelect'
                        inputId='messageNotificationSoundSelectInput'
                        className='react-select inlineSelect'
                        classNamePrefix='react-select'
                        options={optionsOfMessageNotificationSoundsSelect}
                        isClearable={false}
                        isSearchable={false}
                        isDisabled={!isMessageNotificationSoundChecked}
                        placeholder={intl.formatMessage({
                            id: 'user.settings.notifications.desktopNotificationSound.soundSelectPlaceholder',
                            defaultMessage: 'Select a sound',
                        })}
                        components={{IndicatorSeparator: NoIndicatorSeparatorComponent}}
                        value={getValueOfNotificationSoundsSelect(desktopNotificationSound)}
                        onChange={handleChangeForMessageNotificationSoundSelect}
                        aria-labelledby='messageNotificationSoundLabel'
                        getOptionLabel={(option) => getOptionLabel(option, intl)}

                    />
                </div>
            </Fragment>
		);
		maximizedSettingInputs.push(messageSoundSection);
		return maximizedSettingInputs;
	},
	[
        desktopSound,
		handleChangeForMessageNotificationSoundCheckbox,
		handleChangeForMessageNotificationSoundSelect,
		desktopNotificationSound,
	]);

    function handleChangeForMaxSection(section: string) {
        stopTryNotificationRing();
        updateSection(section);
    }

    function handleChangeForMinSection(section: string) {
        stopTryNotificationRing();
        updateSection(section);
        onCancel();
    }

    function handleSubmit() {
        stopTryNotificationRing();
        onSubmit();
    }

    if (active) {
        return (
            <SettingItemMax
                title={
                    <FormattedMessage
                        id='user.settings.notifications.desktopNotificationSounds.title'
                        defaultMessage='Desktop notification sounds'
                    />
                }
                inputs={maximizedSettingInputs}
                submit={handleSubmit}
                saving={saving}
                serverError={error}
                updateSection={handleChangeForMaxSection}
            />
        );
    }

    return (
        <SettingItemMin
            ref={editButtonRef}
            title={
                <FormattedMessage
                    id='user.settings.notifications.desktopNotificationSounds.title'
                    defaultMessage='Desktop notification sounds'
                />
            }
			describe={getCollapsedText(desktopSound, desktopNotificationSound)}
			section={UserSettingsNotificationSections.DESKTOP_NOTIFICATION_SOUND}
			updateSection={handleChangeForMinSection}
		/>
    );
}

function NoIndicatorSeparatorComponent() {
    return null;
}

function getCollapsedText(
	desktopSound: UserNotifyProps['desktop_sound'],
	desktopNotificationSound: UserNotifyProps['desktop_notification_sound'],
) {
	const desktopNotificationSoundIsSelected = notificationSoundKeys.includes(desktopNotificationSound as string);

	let hasDesktopSound: boolean | null = null;
    if (desktopNotificationSoundIsSelected) {
        if (desktopSound === 'true') {
            hasDesktopSound = true;
        } else {
            hasDesktopSound = false;
        }
    }

	if (hasDesktopSound !== null) {
		if (hasDesktopSound) {
			return (
                <FormattedMessage
                    id='user.settings.notifications.desktopNotificationSound.hasDesktopSound'
                    defaultMessage='"{desktopSound}" for messages'
                    values={{desktopSound: desktopNotificationSound}}
                />
            );
        }

        return (
            <FormattedMessage
                id='user.settings.notifications.desktopNotificationSound.noDesktopSound'
                defaultMessage='No sound'
            />
        );
    }

    return (
        <FormattedMessage
            id='user.settings.notifications.desktopNotificationSound.noValidSound'
            defaultMessage='Configure desktop notification sounds'
        />
    );
}

export default memo(DesktopNotificationSoundsSettings);
