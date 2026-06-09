/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Question {
  id: string;
  jabatanId: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  points: number;
}

export interface Jabatan {
  id: string;
  name: string;
  description: string;
  timeLimitMinutes: number;
  passingScore: number; // e.g. 70
  sandi: string; // Maximum 2-digit PIN passcode, e.g. "12"
}

export interface Submission {
  id: string;
  nik: string;
  name: string;
  jabatanId: string;
  jabatanName: string;
  score: number;
  totalQuestions: number;
  correctAnswersCount: number;
  timeTakenSeconds: number;
  timestamp: number; // ms since epoch
  certificateId?: string;
  isPassed: boolean;
  answers: { [questionId: string]: number }; // questionId -> selectedOptionIndex
  photo?: string; // profile photo as base64 data URI
}

export interface UserSession {
  nik: string;
  name: string;
  jabatanId: string;
  startedAt?: number;
  photo?: string; // profile photo as base64 data URI
}
