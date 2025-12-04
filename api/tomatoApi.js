// api/tomatoApi.js - 토마토 스마트팜 통합 API 클라이언트
// 
// 사용법:
//   import tomatoApi from './tomatoApi';
//   const data = await tomatoApi.getRealtimeData();
//
// 또는 개별 함수 import:
//   import { getRealtimeData, captureNow } from './tomatoApi';

const N8N_BASE_URL = 'http://seedfarm.co.kr:5678/webhook';

// ============================================================
// 📊 데이터 조회 API
// ============================================================

/**
 * 실시간 토마토 분석 데이터 조회
 * @returns {Promise<{Ready: number, Not_Ready: number, Disease_Bad: number, Truss: number}>}
 */
export const getRealtimeData = async () => {
  const response = await fetch(`${N8N_BASE_URL}/data-realtime`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

/**
 * 과거 토마토 분석 데이터 조회
 * @param {number} hours - 조회 기간 (시간 단위, 기본값: 1)
 * @returns {Promise<{data: Array}>}
 */
export const getHistoryData = async (hours = 1) => {
  const response = await fetch(`${N8N_BASE_URL}/data-history?hours=${hours}`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

/**
 * 오늘 일일 요약 데이터 조회
 * @returns {Promise<{total_ready: number, total_not_ready: number, total_disease: number, avg_truss: number}>}
 */
export const getDailySummary = async () => {
  const response = await fetch(`${N8N_BASE_URL}/data-summary`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

// ============================================================
// 🎥 카메라 제어 API
// ============================================================

/**
 * 즉시 촬영 및 분석
 * @returns {Promise<{success: boolean, data: Object, timestamp: string}>}
 */
export const captureNow = async () => {
  const response = await fetch(`${N8N_BASE_URL}/camera-capture`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

/**
 * 테스트 촬영 (라즈베리파이 없이 개발용)
 * @returns {Promise<{success: boolean, data: Object, timestamp: string}>}
 */
export const captureTest = async () => {
  const response = await fetch(`${N8N_BASE_URL}/capture-test`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

/**
 * 자동 모니터링 시작
 */
export const startMonitoring = async () => {
  const response = await fetch(`${N8N_BASE_URL}/camera-start`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

/**
 * 자동 모니터링 중지
 */
export const stopMonitoring = async () => {
  const response = await fetch(`${N8N_BASE_URL}/camera-stop`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

/**
 * 카메라 상태 조회
 * @returns {Promise<{monitoring: boolean, interval: number, last_capture: string, white_balance: string}>}
 */
export const getCameraStatus = async () => {
  const response = await fetch(`${N8N_BASE_URL}/camera-status`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

/**
 * 촬영 간격 설정
 * @param {number} interval - 촬영 간격 (초) - 60, 300, 600, 1800, 3600
 */
export const setCaptureInterval = async (interval) => {
  const response = await fetch(`${N8N_BASE_URL}/camera-interval`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ interval }),
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

/**
 * 화이트 밸런스 설정
 * @param {string} mode - auto, fluorescent, tungsten, daylight
 */
export const setWhiteBalance = async (mode) => {
  const response = await fetch(`${N8N_BASE_URL}/camera-white-balance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode }),
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

// ============================================================
// 🤖 AI 분석 API
// ============================================================

/**
 * AI 챗봇 메시지 전송
 * @param {string} message - 사용자 메시지
 * @param {Object|null} image - 이미지 객체 (React Native용)
 * @returns {Promise<{response: string, timestamp: string, success: boolean}>}
 */
export const sendChatMessage = async (message, image = null) => {
  const formData = new FormData();
  formData.append('message', message);
  
  if (image) {
    formData.append('image', {
      uri: image.uri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    });
  }
  
  const response = await fetch(`${N8N_BASE_URL}/chat-message`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

/**
 * 이미지 YOLO 분석 (FormData 방식)
 * @param {Object} imageFile - 이미지 파일 객체
 *   - React Native: { uri: 'file://...', type: 'image/jpeg', name: 'photo.jpg' }
 *   - Web: File 객체 또는 Blob
 * @returns {Promise<{success: boolean, data: Object, timestamp: string}>}
 */
export const analyzeImage = async (imageFile) => {
  const formData = new FormData();
  
  // React Native와 Web 환경 모두 지원
  if (imageFile.uri) {
    // React Native 환경
    formData.append('image', {
      uri: imageFile.uri,
      type: imageFile.type || 'image/jpeg',
      name: imageFile.name || 'capture.jpg',
    });
  } else {
    // Web 환경 (File 또는 Blob)
    formData.append('image', imageFile, imageFile.name || 'capture.jpg');
  }
  
  const response = await fetch(`${N8N_BASE_URL}/capture-analyze`, {
    method: 'POST',
    body: formData,
    // FormData 사용 시 Content-Type 헤더를 설정하지 않음 (브라우저가 자동 설정)
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

/**
 * 병해충 AI 진단 (Base64 방식)
 * @param {Object} imageFile - 이미지 파일 객체
 *   - React Native: { uri: 'file://...', type: 'image/jpeg', name: 'photo.jpg' }
 *   - Web: File 객체 또는 Blob
 * @returns {Promise<{success: boolean, diagnosis: string, healthStatus: string, timestamp: string}>}
 */
export const diagnoseDisease = async (imageFile) => {
  let base64Image;
  let mimeType = 'image/jpeg';
  
  if (imageFile.uri) {
    // React Native 환경 - URI를 Base64로 변환
    const response = await fetch(imageFile.uri);
    const blob = await response.blob();
    base64Image = await blobToBase64(blob);
    mimeType = imageFile.type || 'image/jpeg';
  } else {
    // Web 환경 (File 또는 Blob)
    base64Image = await blobToBase64(imageFile);
    mimeType = imageFile.type || 'image/jpeg';
  }
  
  const response = await fetch(`${N8N_BASE_URL}/disease-diagnosis`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: base64Image,
      mimeType: mimeType,
    }),
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

/**
 * Blob/File을 Base64로 변환하는 헬퍼 함수
 * @param {Blob|File} blob - 이미지 Blob 또는 File
 * @returns {Promise<string>} Base64 문자열 (data: prefix 제외)
 */
const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => {
      // data:image/jpeg;base64,xxxx 형식에서 base64 부분만 추출
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

// 하위 호환성을 위한 별칭 (오타 수정)
export const diagnosDisease = diagnoseDisease;

// ============================================================
// 💰 시장 가격 API
// ============================================================

/**
 * 실시간 시장 가격 조회 (KAMIS)
 */
export const getMarketPrice = async () => {
  const response = await fetch(`${N8N_BASE_URL}/market-price`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

/**
 * 도매가 vs 온라인가 비교
 */
export const getPriceCompare = async () => {
  const response = await fetch(`${N8N_BASE_URL}/price-compare`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

/**
 * 가격 추이 조회
 * @param {string} start - 시작일 (YYYY-MM-DD)
 * @param {string} end - 종료일 (YYYY-MM-DD)
 */
export const getPriceHistory = async (start, end) => {
  let url = `${N8N_BASE_URL}/price-history`;
  const params = new URLSearchParams();
  if (start) params.append('start', start);
  if (end) params.append('end', end);
  if (params.toString()) url += `?${params.toString()}`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

// ============================================================
// 🌱 수확량 예측 API
// ============================================================

/**
 * 수확량 예측
 * @param {Object} data - 예측 입력 데이터
 * @param {number} data.temperature - 온도 (°C) [필수]
 * @param {number} data.humidity - 습도 (%) [필수]
 * @param {number} [data.month] - 월 (1-12)
 * @param {number} [data.co2] - CO2 농도 (ppm)
 * @param {number} [data.solar_radiation] - 일사량
 * @param {string} [data.growth_stage] - 생육 단계
 * @param {string} [data.facility_type] - 시설 타입 (비닐하우스/유리온실)
 */
export const predictYield = async (data) => {
  const response = await fetch(`${N8N_BASE_URL}/yield-prediction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

// ============================================================
// 📝 농장 일지 API
// ============================================================

/**
 * 일지 목록 조회
 * @param {number} days - 조회 기간 (일, 기본값: 7)
 */
export const getDiaryList = async (days = 7) => {
  const response = await fetch(`${N8N_BASE_URL}/app/diary?days=${days}`);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

/**
 * 일지 저장
 * @param {Object} entry - 일지 데이터
 * @param {string} [entry.date] - 날짜 (YYYY-MM-DD)
 * @param {number} [entry.harvest_kg] - 수확량 (kg)
 * @param {string} [entry.memo] - 메모
 */
export const saveDiary = async (entry) => {
  const response = await fetch(`${N8N_BASE_URL}/app/diary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

// ============================================================
// 🏠 앱 홈 화면 API
// ============================================================

/**
 * 홈 화면 통합 데이터 조회
 * - 필드명이 소문자로 매핑됨 (ready, not_ready, disease, truss)
 */
export const getHomeData = async () => {
  try {
    const response = await fetch(`${N8N_BASE_URL}/app/home`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  } catch (error) {
    // 에러 시 기본값 반환
    return {
      success: false,
      realtime: { ready: 0, not_ready: 0, disease: 0, truss: 0 },
      today_summary: { total_detected: 0, total_ready: 0, total_disease: 0, harvest_rate: 0 },
      alerts: [],
      error: error.message,
    };
  }
};

/**
 * 앱용 간편 채팅 (API 키 포함)
 * @param {string} message - 메시지
 * @param {string} apiKey - API 키 (기본값: tomato-farm-2024)
 */
export const appChat = async (message, apiKey = 'tomato-farm-2024') => {
  const response = await fetch(`${N8N_BASE_URL}/app/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, api_key: apiKey }),
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

/**
 * 앱용 이미지 분석
 * @param {Object} imageFile - 이미지 파일 객체
 */
export const appAnalyze = async (imageFile) => {
  const formData = new FormData();
  formData.append('file', imageFile);
  
  const response = await fetch(`${N8N_BASE_URL}/app/analyze`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

// ============================================================
// 기본 내보내기
// ============================================================

export default {
  // 데이터 조회
  getRealtimeData,
  getHistoryData,
  getDailySummary,
  
  // 카메라 제어
  captureNow,
  captureTest,
  startMonitoring,
  stopMonitoring,
  getCameraStatus,
  setCaptureInterval,
  setWhiteBalance,
  
  // AI 분석
  sendChatMessage,
  analyzeImage,
  diagnoseDisease,
  diagnosDisease,  // 하위 호환성
  
  // 시장 가격
  getMarketPrice,
  getPriceCompare,
  getPriceHistory,
  
  // 수확량 예측
  predictYield,
  
  // 농장 일지
  getDiaryList,
  saveDiary,
  
  // 앱 홈 화면
  getHomeData,
  appChat,
  appAnalyze,
};