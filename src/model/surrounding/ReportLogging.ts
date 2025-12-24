export interface FileLogging {
    idlogging: string;
    fullname: string;
    action_log: string;
    source_path: string;
    target_path: string;
    updated_date: Date;
}

export interface FileActivity {
    idfileactivity: string;
    file_name: string;
    action: string;
    status: string;
    file_logging: FileLogging[];
}
