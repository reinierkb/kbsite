const os = require('os');

/**
 * Detects the current platform and architecture
 * @returns {Object} Platform information
 */
function getPlatformInfo() {
    const platform = os.platform();
    const arch = os.arch();
    
    return {
        platform,
        arch,
        isArm64: arch === 'arm64',
        isIntel: arch === 'x64',
        isDarwin: platform === 'darwin',
        isLinux: platform === 'linux',
        isWindows: platform === 'win32'
    };
}

/**
 * Checks if we're likely running in a devcontainer
 * @returns {boolean}
 */
function isDevContainer() {
    // Common indicators of running in a devcontainer
    return !!(
        process.env.REMOTE_CONTAINERS ||
        process.env.CODESPACES ||
        process.env.DEVCONTAINER ||
        process.env.VSCODE_REMOTE_CONTAINERS_SESSION
    );
}

/**
 * Determines if sharp should be used based on platform and environment
 * @returns {boolean}
 */
function shouldUseSharp() {
    const platformInfo = getPlatformInfo();
    const inDevContainer = isDevContainer();
    
    // In devcontainers, especially on x64, sharp can be problematic
    // Skip sharp usage in devcontainers unless explicitly enabled
    if (inDevContainer) {
        const forceSharp = process.env.FORCE_SHARP === 'true';
        if (!forceSharp) {
            console.log('🐳 DevContainer detected - skipping image processing to avoid architecture conflicts');
            console.log('   Set FORCE_SHARP=true to enable image processing in devcontainer');
            return false;
        }
    }
    
    // On ARM64 systems (like M1/M2 Macs), sharp usually works fine
    if (platformInfo.isArm64) {
        return true;
    }
    
    // On x64 systems, check if we're in a problematic environment
    if (platformInfo.isIntel) {
        // Allow sharp on native x64 systems
        return true;
    }
    
    // Default to allowing sharp
    return true;
}

module.exports = {
    getPlatformInfo,
    isDevContainer,
    shouldUseSharp
};