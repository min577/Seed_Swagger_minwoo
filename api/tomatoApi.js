/**
 * 🍅 토마토 스마트팜 API 클라이언트 v2.1
 * 
 * n8n 워크플로우 기반 REST API 클라이언트
 * 프론트엔드에서 바로 사용 가능
 * 
 * @version 2.1.0
 * @updated 2025-12-12
 * 
 * 변경사항 (v2.1):
 * - Chat History API 추가 (목록/상세/삭제)
 * - session_id 지원
 */

const BASE_URL = 'https://n8n.seedfarm.co.kr/webhook';

// ============================================================
// 📊 Data API - 데이터 조회
// ============================================================

/**
 * 실시간 토마토 분석 데이터 조회
 * @returns {Promise<{Ready: number, Not_Ready: number, Disease_Bad: number, Truss: number}>}
 */
export async function getRealtimeData() {
  const response = await fetch(`${BASE_URL}/data-realtime`);
  return response.json();
}

/**
 * 과거 토마토 분석 데이터 조회
 * @param {number} hours - 조회 기간 (시간 단위, 기본값: 1)
 * @returns {Promise<{data: Array}>}
 */
export async function getHistoryData(hours = 1) {
  const response = await fetch(`${BASE_URL}/data-history?hours=${hours}`);
  return response.json();
}

/**
 * 오늘 일일 요약 데이터 조회
 * @returns {Promise<{total_ready: number, total_not_ready: number, total_disease: number, avg_truss: number}>}
 */
export async function getDailySummary() {
  const response = await fetch(`${BASE_URL}/data-summary`);
  return response.json();
}

// ============================================================
// 🎥 Camera API - 카메라 제어
// ============================================================

/**
 * 즉시 촬영 및 분석
 * @returns {Promise<{success: boolean, data: object, timestamp: string}>}
 */
export async function captureNow() {
  const response = await fetch(`${BASE_URL}/camera-capture`, {
    method: 'POST'
  });
  return response.json();
}

/**
 * 테스트 촬영 (랜덤 데이터)
 * @returns {Promise<{success: boolean, data: object}>}
 */
export async function captureTest() {
  const response = await fetch(`${BASE_URL}/capture-test`, {
    method: 'POST'
  });
  return response.json();
}

/**
 * 자동 모니터링 시작
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function startMonitoring() {
  const response = await fetch(`${BASE_URL}/camera-start`, {
    method: 'POST'
  });
  return response.json();
}

/**
 * 자동 모니터링 중지
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function stopMonitoring() {
  const response = await fetch(`${BASE_URL}/camera-stop`, {
    method: 'POST'
  });
  return response.json();
}

/**
 * 카메라 상태 조회
 * @returns {Promise<{monitoring: boolean, interval: number, last_capture: string}>}
 */
export async function getCameraStatus() {
  const response = await fetch(`${BASE_URL}/camera-status`);
  return response.json();
}

/**
 * 촬영 간격 설정
 * @param {number} interval - 촬영 간격 (초): 60, 300, 600, 1800, 3600
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function setCaptureInterval(interval) {
  const response = await fetch(`${BASE_URL}/camera-interval`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ interval })
  });
  return response.json();
}

/**
 * 화이트 밸런스 설정
 * @param {string} mode - 모드: auto, fluorescent, tungsten, daylight
 * @returns {Promise<{success: boolean}>}
 */
export async function setWhiteBalance(mode) {
  const response = await fetch(`${BASE_URL}/camera-white-balance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode })
  });
  return response.json();
}

// ============================================================
// 🤖 AI API - 인공지능
// ============================================================

/**
 * AI 챗봇 메시지 전송 (지식베이스 연동)
 * @param {string} message - 사용자 메시지
 * @param {string} [sessionId] - 세션 ID (대화 저장용, 선택)
 * @returns {Promise<{response: string, timestamp: string, success: boolean, threadId?: string}>}
 * 
 * @example
 * // 세션 없이 질문
 * const result = await sendChatMessage("토마토 병해 알려줘");
 * 
 * // 세션 ID로 대화 저장
 * const result = await sendChatMessage("흰가루병 치료법", "my_session_001");
 */
export async function sendChatMessage(message, sessionId = null) {
  const body = { message };
  if (sessionId) {
    body.session_id = sessionId;
  }
  
  const response = await fetch(`${BASE_URL}/chat-message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return response.json();
}

/**
 * 이미지 YOLO 분석 (FormData)
 * @param {File|Blob} imageFile - 이미지 파일
 * @returns {Promise<{success: boolean, data: object}>}
 * 
 * @example
 * const fileInput = document.querySelector('input[type="file"]');
 * const result = await analyzeImage(fileInput.files[0]);
 */
export async function analyzeImage(imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  const response = await fetch(`${BASE_URL}/capture-analyze`, {
    method: 'POST',
    body: formData
  });
  return response.json();
}

/**
 * 병해충 AI 진단 (Base64)
 * @param {string} base64Image - Base64 인코딩된 이미지 (data: prefix 제외)
 * @param {string} [mimeType='image/jpeg'] - 이미지 MIME 타입
 * @returns {Promise<{success: boolean, diagnosis: string, healthStatus: string}>}
 * 
 * @example
 * // File을 Base64로 변환 후 전송
 * const base64 = await fileToBase64(file);
 * const result = await diagnoseDisease(base64);
 */
export async function diagnoseDisease(base64Image, mimeType = 'image/jpeg') {
  const response = await fetch(`${BASE_URL}/disease-diagnosis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: base64Image,
      mimeType
    })
  });
  return response.json();
}

// ============================================================
// 💬 Chat History API - 채팅 히스토리 (NEW v2.1)
// ============================================================

/**
 * 대화 목록 조회 (페이지네이션)
 * @param {number} [page=1] - 페이지 번호
 * @param {number} [limit=10] - 페이지당 항목 수
 * @returns {Promise<{success: boolean, data: Array, pagination: object}>}
 * 
 * @example
 * const result = await getChatHistoryList(1, 10);
 * console.log(result.data); // [{id, title, createdAt}, ...]
 * console.log(result.pagination); // {currentPage, totalPages, totalCount, limit}
 */
export async function getChatHistoryList(page = 1, limit = 10) {
  const response = await fetch(
    `${BASE_URL}/chat-message/history?page=${page}&limit=${limit}`
  );
  return response.json();
}

/**
 * 대화 상세 조회 (메시지 내역)
 * @param {string} threadId - 대화 스레드 ID
 * @returns {Promise<{success: boolean, messages: Array<{role: string, content: string}>}>}
 * 
 * @example
 * const result = await getChatHistoryDetail("my_session_001");
 * result.messages.forEach(msg => {
 *   console.log(`${msg.role}: ${msg.content}`);
 * });
 */
export async function getChatHistoryDetail(threadId) {
  const response = await fetch(
    `${BASE_URL}/chat-message/history/detail?threadId=${encodeURIComponent(threadId)}`
  );
  return response.json();
}

/**
 * 대화 삭제
 * @param {string} threadId - 삭제할 대화 스레드 ID
 * @returns {Promise<{success: boolean, message: string, deletedThreadId: string}>}
 * 
 * @example
 * const result = await deleteChatHistory("my_session_001");
 * if (result.success) {
 *   console.log("삭제 완료:", result.deletedThreadId);
 * }
 */
export async function deleteChatHistory(threadId) {
  const response = await fetch(
    `${BASE_URL}/chat-message/history/delete?threadId=${encodeURIComponent(threadId)}`,
    { method: 'DELETE' }
  );
  return response.json();
}

// ============================================================
// 💰 Market API - 시장 가격
// ============================================================

/**
 * 실시간 시장 가격 조회 (KAMIS)
 * @returns {Promise<{success: boolean, data: object}>}
 */
export async function getMarketPrice() {
  const response = await fetch(`${BASE_URL}/market-price`);
  return response.json();
}

/**
 * 도매가 vs 온라인가 비교
 * @returns {Promise<{success: boolean, wholesale_summary: object, online_summary: object, comparison: Array}>}
 */
export async function getPriceCompare() {
  const response = await fetch(`${BASE_URL}/price-compare`);
  return response.json();
}

/**
 * 가격 추이 조회
 * @param {string} start - 시작일 (YYYY-MM-DD)
 * @param {string} end - 종료일 (YYYY-MM-DD)
 * @returns {Promise<{success: boolean, data: Array, stats: object}>}
 */
export async function getPriceHistory(start, end) {
  const response = await fetch(`${BASE_URL}/price-history?start=${start}&end=${end}`);
  return response.json();
}

// ============================================================
// 🌱 Prediction API - 수확량 예측
// ============================================================

/**
 * 수확량 예측
 * @param {object} params - 환경 데이터
 * @param {number} params.temperature - 평균 온도 (°C, 필수)
 * @param {number} params.humidity - 평균 습도 (%, 필수)
 * @param {number} [params.co2] - CO2 농도 (ppm)
 * @param {number} [params.ec] - EC 값 (dS/m)
 * @param {number} [params.ph] - pH 값
 * @param {string} [params.facility_type] - 시설 유형: "비닐" | "유리"
 * @param {number} [params.area] - 재배 면적 (m²)
 * @returns {Promise<{success: boolean, predicted_yield: number, recommendations: Array}>}
 * 
 * @example
 * const result = await predictYield({
 *   temperature: 25.5,
 *   humidity: 70,
 *   co2: 800,
 *   facility_type: "비닐",
 *   area: 1000
 * });
 */
export async function predictYield(params) {
  const response = await fetch(`${BASE_URL}/yield-prediction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  return response.json();
}

// ============================================================
// 📝 Diary API - 농장 일지
// ============================================================

/**
 * 일지 목록 조회
 * @param {number} [days=7] - 조회 기간 (일)
 * @returns {Promise<{success: boolean, data: Array}>}
 */
export async function getDiaryList(days = 7) {
  const response = await fetch(`${BASE_URL}/app/diary?days=${days}`);
  return response.json();
}

/**
 * 일지 저장
 * @param {object} entry - 일지 데이터
 * @param {string} entry.date - 날짜 (YYYY-MM-DD)
 * @param {string} [entry.weather] - 날씨
 * @param {number} [entry.temperature] - 온도
 * @param {number} [entry.humidity] - 습도
 * @param {string} [entry.work_done] - 작업 내용
 * @param {string} [entry.notes] - 메모
 * @returns {Promise<{success: boolean, saved: object}>}
 */
export async function saveDiary(entry) {
  const response = await fetch(`${BASE_URL}/app/diary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry)
  });
  return response.json();
}

// ============================================================
// 🏠 Home API - 앱 홈 화면
// ============================================================

/**
 * 홈 화면 통합 데이터
 * @returns {Promise<{success: boolean, realtime: object, summary: object, alerts: Array}>}
 */
export async function getHomeData() {
  const response = await fetch(`${BASE_URL}/app/home`);
  return response.json();
}

/**
 * 앱용 간편 채팅
 * @param {string} message - 메시지
 * @param {string} [apiKey] - API 키
 * @returns {Promise<{response: string, success: boolean}>}
 */
export async function appChat(message, apiKey = 'tomato-farm-2024') {
  const response = await fetch(`${BASE_URL}/app/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, api_key: apiKey })
  });
  return response.json();
}

/**
 * 앱용 이미지 분석
 * @param {File|Blob} file - 이미지 파일
 * @returns {Promise<{success: boolean, data: object}>}
 */
export async function appAnalyze(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${BASE_URL}/app/analyze`, {
    method: 'POST',
    body: formData
  });
  return response.json();
}

// ============================================================
// 🛠️ Utility Functions - 유틸리티
// ============================================================

/**
 * File을 Base64 문자열로 변환
 * @param {File} file - 파일 객체
 * @returns {Promise<string>} Base64 문자열 (data: prefix 제외)
 * 
 * @example
 * const base64 = await fileToBase64(file);
 * const result = await diagnoseDisease(base64);
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // "data:image/jpeg;base64,XXXX" 에서 base64 부분만 추출
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}

/**
 * API 기본 URL 변경 (개발/운영 환경 전환)
 * @param {string} url - 새 기본 URL
 * 
 * @example
 * // 내부 서버로 전환
 * setBaseUrl('http://192.168.49.200:5679/webhook');
 */
export function setBaseUrl(url) {
  // Note: ES6 모듈에서는 const를 재할당할 수 없으므로
  // 실제 구현 시에는 let으로 변경하거나 config 객체 사용
  console.warn('setBaseUrl은 현재 구현되지 않았습니다. BASE_URL을 직접 수정하세요.');
}

// ============================================================
// 📦 Default Export - 모든 API를 객체로 내보내기
// ============================================================

const tomatoApi = {
  // Data
  getRealtimeData,
  getHistoryData,
  getDailySummary,
  
  // Camera
  captureNow,
  captureTest,
  startMonitoring,
  stopMonitoring,
  getCameraStatus,
  setCaptureInterval,
  setWhiteBalance,
  
  // AI
  sendChatMessage,
  analyzeImage,
  diagnoseDisease,
  
  // Chat History (NEW v2.1)
  getChatHistoryList,
  getChatHistoryDetail,
  deleteChatHistory,
  
  // Market
  getMarketPrice,
  getPriceCompare,
  getPriceHistory,
  
  // Prediction
  predictYield,
  
  // Diary
  getDiaryList,
  saveDiary,
  
  // Home
  getHomeData,
  appChat,
  appAnalyze,
  
  // Utility
  fileToBase64
};

export default tomatoApi;


// ============================================================
// 💡 Usage Examples (테스트용)
// ============================================================

/*
// 1. ES6 모듈 방식 (권장)
import tomatoApi from './tomatoApi.js';
// 또는
import { sendChatMessage, getChatHistoryList } from './tomatoApi.js';

// 2. 채팅 + 세션 저장
const chatResult = await tomatoApi.sendChatMessage(
  "토마토 흰가루병 치료법 알려줘", 
  "user_001_session_001"
);
console.log(chatResult.response);
console.log(chatResult.threadId); // "user_001_session_001"

// 3. 대화 목록 조회
const historyList = await tomatoApi.getChatHistoryList(1, 10);
historyList.data.forEach(thread => {
  console.log(`[${thread.id}] ${thread.title} - ${thread.createdAt}`);
});

// 4. 대화 상세 조회
const detail = await tomatoApi.getChatHistoryDetail("user_001_session_001");
detail.messages.forEach(msg => {
  console.log(`${msg.role}: ${msg.content}`);
});

// 5. 대화 삭제
const deleteResult = await tomatoApi.deleteChatHistory("user_001_session_001");
if (deleteResult.success) {
  console.log("삭제 완료!");
}

// 6. 병해충 진단 (Base64)
const file = document.querySelector('input[type="file"]').files[0];
const base64 = await tomatoApi.fileToBase64(file);
const diagnosis = await tomatoApi.diagnoseDisease(base64);
console.log(diagnosis.healthStatus); // "건강" | "주의" | "위험"

// 7. 수확량 예측
const prediction = await tomatoApi.predictYield({
  temperature: 25,
  humidity: 70,
  co2: 800,
  facility_type: "비닐",
  area: 1000
});
console.log(`예측 수확량: ${prediction.predicted_yield} kg/10a`);
*/