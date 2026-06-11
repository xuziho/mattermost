// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import type {AnchorHTMLAttributes, ReactNode} from 'react';

interface Props {
    nodeAttributes: AnchorHTMLAttributes<HTMLAnchorElement>;
    children: ReactNode;
}

export default function PluginLinkTooltip(props: Props) {
    return (
        <a {...props.nodeAttributes}>
            {props.children}
        </a>
    );
}
