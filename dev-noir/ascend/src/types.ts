export interface CourseTask {
  id: string;
  name: string;
  progress: number; // 0 to 100
}

export interface Course {
  id: string;
  code: string;
  name: string;
  examDate: string; // ISO string
  notes: string;
  tasks: CourseTask[];
}

export interface AppState {
  courses: Course[];
  lastUsedPomodoroSettings: {
    work: number;
    break: number;
  };
}
