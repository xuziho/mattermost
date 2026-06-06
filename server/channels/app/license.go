// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"github.com/golang-jwt/jwt/v5"

	"github.com/mattermost/mattermost/server/public/model"
)

func (ch *Channels) License() *model.License {
	return ch.srv.License()
}

// JWTClaims custom JWT claims with the needed information for the
// renewal process
type JWTClaims struct {
	LicenseID   string `json:"license_id"`
	ActiveUsers int64  `json:"active_users"`
	jwt.RegisteredClaims
}

func (s *Server) License() *model.License {
	return s.platform.License()
}

func (s *Server) LoadLicense() {
	s.platform.LoadLicense()
}

func (s *Server) SaveLicense(licenseBytes []byte) (*model.License, *model.AppError) {
	return s.platform.SaveLicense(licenseBytes)
}

func (s *Server) SetLicense(license *model.License) bool {
	return s.platform.SetLicense(license)
}

func (s *Server) ValidateAndSetLicenseBytes(b []byte) error {
	return s.platform.ValidateAndSetLicenseBytes(b)
}

func (s *Server) SetClientLicense(m map[string]string) {
	s.platform.SetClientLicense(m)
}

func (s *Server) ClientLicense() map[string]string {
	return s.platform.ClientLicense()
}

func (s *Server) RemoveLicense() *model.AppError {
	return s.platform.RemoveLicense()
}

func (s *Server) AddLicenseListener(listener func(oldLicense, newLicense *model.License)) string {
	return s.platform.AddLicenseListener(listener)
}

func (s *Server) RemoveLicenseListener(id string) {
	s.platform.RemoveLicenseListener(id)
}

func (s *Server) GetSanitizedClientLicense() map[string]string {
	return s.platform.GetSanitizedClientLicense()
}
