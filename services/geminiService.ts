

import { GoogleGenAI, Type } from "@google/genai";
import type { Device, Driver, SystemInfo, AppMode } from '../types';

// --- HARDWARE SIMULATION PROFILES ---

const hardwareProfiles = [
  { // Profile 1: High-End Gaming Rig
    systemInfo: {
      os: 'Windows 11 Pro 64-bit',
      cpu: 'Intel Core i9-13900K',
      ram: '32.0 GB',
      motherboard: 'ASUS ROG STRIX Z790-E GAMING',
    },
    devices: [
      { componentType: 'GPU', modelName: 'NVIDIA GeForce RTX 4080' },
      { componentType: 'CPU', modelName: 'Intel Core i9-13900K' },
      { componentType: 'Motherboard', modelName: 'ASUS ROG STRIX Z790-E GAMING' },
      { componentType: 'Audio Device', modelName: 'Realtek ALC4080 High Definition Audio' },
      { componentType: 'Network Adapter', modelName: 'Intel(R) Ethernet Controller I225-V' },
      { componentType: 'Wi-Fi Adapter', modelName: 'Intel(R) Wi-Fi 6E AX211' },
      { componentType: 'Storage', modelName: 'Samsung 990 Pro NVMe SSD' },
      { componentType: 'Generic Device', modelName: 'SM Bus Controller' }
    ],
    mockDrivers: [
      { deviceName: 'NVIDIA GeForce RTX 4080', provider: 'NVIDIA', currentVersion: '551.76', currentReleaseDate: '2024-03-05', latestVersion: '555.99', latestReleaseDate: '2024-05-28', status: 'Update available', hardwareId: 'PCI\\VEN_10DE&DEV_2704' },
      { deviceName: 'Intel Core i9-13900K', provider: 'Intel', currentVersion: '10.1.19600.8418', currentReleaseDate: '2023-11-10', latestVersion: '10.1.19600.8418', latestReleaseDate: '2023-11-10', status: 'Up-to-date', hardwareId: 'ACPI\\GenuineIntel_-_Intel64_Family_6' },
      { deviceName: 'ASUS ROG STRIX Z790-E GAMING', provider: 'ASUS', currentVersion: 'BIOS 1904', currentReleaseDate: '2024-02-28', latestVersion: 'BIOS 2102', latestReleaseDate: '2024-05-17', status: 'Update available', hardwareId: 'ACPI\\PNP0C01' },
      { deviceName: 'SM Bus Controller', provider: 'Intel', currentVersion: '', currentReleaseDate: '', latestVersion: '10.1.19600.8418', latestReleaseDate: '2023-11-10', status: 'Missing', hardwareId: 'PCI\\VEN_8086&DEV_7A23' },
      { deviceName: 'Realtek ALC4080 High Definition Audio', provider: 'Realtek', currentVersion: '6.0.9549.1', currentReleaseDate: '2023-08-15', latestVersion: '6.0.9675.1', latestReleaseDate: '2024-04-22', status: 'Update available', hardwareId: 'HDAUDIO\\FUNC_01&VEN_10EC' },
      { deviceName: 'Intel(R) Ethernet Controller I225-V', provider: 'Intel', currentVersion: '2.1.3.3', currentReleaseDate: '2023-05-10', latestVersion: '2.1.4.0', latestReleaseDate: '2024-01-19', status: 'Update available', hardwareId: 'PCI\\VEN_8086&DEV_15F3' },
      { deviceName: 'Intel(R) Wi-Fi 6E AX211', provider: 'Intel', currentVersion: '23.30.0.5', currentReleaseDate: '2024-02-13', latestVersion: '23.30.0.5', latestReleaseDate: '2024-02-13', status: 'Up-to-date', hardwareId: 'PCI\\VEN_8086&DEV_2725' },
      { deviceName: 'Samsung 990 Pro NVMe SSD', provider: 'Samsung', currentVersion: '4B2QJXD7', currentReleaseDate: '2023-09-01', latestVersion: '5B2QJXD7', latestReleaseDate: '2024-02-15', status: 'Update available', hardwareId: 'SCSI\\DiskNVMe____Samsung_SSD_990' },
    ]
  },
  { // Profile 2: Office Workstation
    systemInfo: {
      os: 'Windows 10 Pro 64-bit',
      cpu: 'Intel Core i5-12400',
      ram: '16.0 GB',
      motherboard: 'Dell OptiPlex 5000',
    },
    devices: [
        { componentType: 'GPU', modelName: 'Intel UHD Graphics 730' },
        { componentType: 'CPU', modelName: 'Intel Core i5-12400' },
        { componentType: 'Audio Device', modelName: 'Realtek Audio' },
        { componentType: 'Network Adapter', modelName: 'Realtek PCIe GbE Family Controller' },
        { componentType: 'Storage', modelName: 'WD Blue SN570 NVMe SSD' },
    ],
    mockDrivers: [
        { deviceName: 'Intel UHD Graphics 730', provider: 'Intel', currentVersion: '30.0.101.1191', currentReleaseDate: '2021-12-15', latestVersion: '31.0.101.5590', latestReleaseDate: '2024-06-11', status: 'Update available', hardwareId: 'PCI\\VEN_8086&DEV_4692' },
        { deviceName: 'Intel Core i5-12400', provider: 'Intel', currentVersion: '10.1.18836.8283', currentReleaseDate: '2022-01-20', latestVersion: '10.1.18836.8283', latestReleaseDate: '2022-01-20', status: 'Up-to-date', hardwareId: 'ACPI\\GenuineIntel_-_Intel64_Family_6' },
        { deviceName: 'Realtek Audio', provider: 'Realtek', currentVersion: '6.0.9231.1', currentReleaseDate: '2021-08-10', latestVersion: '6.0.9231.1', latestReleaseDate: '2021-08-10', status: 'Up-to-date', hardwareId: 'HDAUDIO\\FUNC_01&VEN_10EC&DEV_0256' },
        { deviceName: 'Realtek PCIe GbE Family Controller', provider: 'Realtek', currentVersion: '10.56.120.2022', currentReleaseDate: '2022-01-20', latestVersion: '10.68.815.2023', latestReleaseDate: '2023-08-15', status: 'Update available', hardwareId: 'PCI\\VEN_10EC&DEV_8168' },
        { deviceName: 'WD Blue SN570 NVMe SSD', provider: 'Western Digital', currentVersion: '234100WD', currentReleaseDate: '2022-04-01', latestVersion: '234240WD', latestReleaseDate: '2023-05-19', status: 'Update available', hardwareId: 'SCSI\\DiskNVMe____WDC_WDS500G3B0C' },
    ]
  }
] as const;

// --- SERVICE INITIALIZATION ---

const selectedProfile = hardwareProfiles[Math.floor(Math.random() * hardwareProfiles.length)];
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const driverSchema = {
    type: Type.OBJECT,
    properties: {
        deviceName: { type: Type.STRING },
        provider: { type: Type.STRING },
        currentVersion: { type: Type.STRING },
        currentReleaseDate: { type: Type.STRING, description: "The release date of the current driver in YYYY-MM-DD format. Can be an empty string if the driver is missing." },
        latestVersion: { type: Type.STRING },
        latestReleaseDate: { type: Type.STRING, description: "The release date of the latest driver in YYYY-MM-DD format." },
        status: { type: Type.STRING, enum: ['Update available', 'Up-to-date', 'Missing'] },
        hardwareId: { type: Type.STRING },
    },
    required: ['deviceName', 'provider', 'currentVersion', 'currentReleaseDate', 'latestVersion', 'latestReleaseDate', 'status', 'hardwareId']
};

// --- EXPORTED FUNCTIONS ---

export const getSystemInfo = async (): Promise<SystemInfo> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return selectedProfile.systemInfo;
};

export const generateDeviceList = async (): Promise<Device[]> => {
  console.log("Simulating device scan using profile:", selectedProfile.systemInfo.motherboard);
  await new Promise(resolve => setTimeout(resolve, 1500)); 
  console.log("Simulated device scan complete.");
  return [...selectedProfile.devices];
};

export const fetchDriverUpdates = async (devices: Device[], mode: AppMode): Promise<Driver[]> => {
    if (mode === 'offline') {
        return fetchOfflineDriverUpdates(devices);
    } else {
        return fetchOnlineDriverUpdates(devices);
    }
};

// --- INTERNAL HELPER FUNCTIONS ---

const fetchOfflineDriverUpdates = async (devices: Device[]): Promise<Driver[]> => {
    console.log("Fetching drivers from OFFLINE pack...");
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const driversForFoundDevices = selectedProfile.mockDrivers.filter(driver =>
        devices.some(device => device.modelName === driver.deviceName)
    );
    
    console.log("Offline driver fetch complete.");
    return driversForFoundDevices.map((driver) => ({
        ...driver,
        id: `${driver.deviceName}-${driver.latestVersion}`,
    }));
}

// Defines the shape of the driver object returned by the AI.
// The status property is a subset of DriverStatus, ensuring type compatibility.
type AiDriverResponse = {
    deviceName: string;
    provider: string;
    currentVersion: string;
    currentReleaseDate: string;
    latestVersion: string;
    latestReleaseDate: string;
    status: 'Update available' | 'Up-to-date' | 'Missing';
    hardwareId: string;
};

const fetchOnlineDriverUpdates = async (devices: Device[]): Promise<Driver[]> => {
    console.log("Fetching drivers from ONLINE AI...");

    const deviceListString = devices.map(d => `- ${d.componentType}: ${d.modelName}`).join('\n');
    const systemString = `OS: ${selectedProfile.systemInfo.os}, Motherboard: ${selectedProfile.systemInfo.motherboard}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are a hardware driver database expert for a professional driver utility. Your task is to provide a list of the latest available drivers for the following hardware components, running on the specified system.
- For each device, determine if a driver is missing, an update is available, or if it's likely up-to-date based on common knowledge.
- You MUST fabricate a realistic "currentVersion" and "currentReleaseDate" for comparison purposes.
- You MUST provide the "latestVersion" and "latestReleaseDate".
- You MUST provide a realistic "hardwareId" for each device.
- All dates must be in YYYY-MM-DD format.

System Information:
${systemString}

Hardware List:
${deviceListString}

Respond ONLY with a JSON array that adheres to the provided schema. Do not add any extra commentary.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: driverSchema
                },
            },
        });
        
        const resultText = response.text.trim();
        const resultDrivers: AiDriverResponse[] = JSON.parse(resultText);

        console.log("Online AI driver fetch complete.");
        return resultDrivers.map(driver => ({
            ...driver,
            id: `${driver.deviceName}-${driver.latestVersion}`,
        }));

    } catch (error) {
        console.error("Gemini API call failed:", error);
        throw new Error("Failed to fetch live driver data from the AI. Check the console for details.");
    }
}
