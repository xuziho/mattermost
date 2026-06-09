# Mattermost Docker Preview Image

This is a Docker image to install Mattermost in *Preview Mode* for exploring product functionality on a single machine using Docker.

Note: This configuration should not be used in production, as it uses a known password string, contains other non-production configuration settings, and does not support upgrade. Use the AgentCompanyOS deployment handoff for production deployment guidance.

To contribute, please see [Contribution Guidelines](https://developers.mattermost.com/contribute/more-info/getting-started/).

To file issues, [search for existing bugs and file a GitHub issue if your bug is new](https://developers.mattermost.com/contribute/why-contribute/#youve-found-a-bug).

## Usage

This preview image is intended for local smoke testing only.

If you have Docker already set up, you can run this image in one line:

```
docker run --name mattermost-preview -d --publish 8065:8065 --add-host dockerhost:127.0.0.1 mattermost/mattermost-preview
```
