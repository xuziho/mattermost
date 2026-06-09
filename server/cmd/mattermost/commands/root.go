// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package commands

import (
	"os"

	"github.com/mattermost/mattermost/server/public/shared/mlog"
	"github.com/spf13/cobra"
)

type Command = cobra.Command

func Run(args []string) error {
	RootCmd.SetArgs(args)
	return RootCmd.Execute()
}

var RootCmd = &cobra.Command{
	Use:   "mattermost",
	Short: "AgentCompanyOS lightweight collaboration frontend",
	Long:  `AgentCompanyOS provides a lightweight self-hosted collaboration frontend with messaging, search, files, and integrations for agent workflows.`,
	PersistentPreRun: func(cmd *cobra.Command, args []string) {
		checkForRootUser()
	},
}

func init() {
	RootCmd.PersistentFlags().StringP("config", "c", "", "Configuration file to use.")
}

// checkForRootUser logs a warning if the process is running as root
func checkForRootUser() {
	if os.Geteuid() == 0 {
		mlog.Warn("Running Mattermost as root is not recommended. Please use a non-root user.")
	}
}
