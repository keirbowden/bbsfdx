export interface DeployResult {
    done: boolean;
    status: string;
    success: boolean;
}

export interface RetrieveResult {
    done: boolean;
    status: string;
    success: boolean;
    zipFile: string;
}