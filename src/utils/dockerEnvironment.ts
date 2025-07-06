/**
 * Docker environment detection utility.
 *
 * Checks for the DOCKER_CONTAINER environment variable as set in the project's Dockerfile:
 * ENV DOCKER_CONTAINER=true
 */
export function isDockerEnvironment(): boolean {
	return process.env.DOCKER_CONTAINER === "true"
}
