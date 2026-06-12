// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import Pluggable from 'plugins/pluggable';

const PluginRoot = () => {
    return (
        <Pluggable pluggableName='Root'/>
    );
};

export default PluginRoot;
