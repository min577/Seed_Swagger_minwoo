# 🍅 토마토 스마트팜 REST API with Swagger

토마토 스마트팜 관리 시스템 REST API 문서 - Swagger/OpenAPI 3.0 기반

## 📋 프로젝트 소개

SEED FARM 토마토 스마트팜 시스템의 백엔드 REST API 서버입니다. n8n 워크플로우 기반으로 구현되어 있으며, IoT 카메라 제어, AI 기반 토마토 분석, 시장 가격 조회, 수확량 예측 등의 기능을 제공합니다.

## 🚀 주요 기능

| 카테고리 | 기능 | 설명 |
|---------|------|------|
| 📊 **데이터** | 실시간/히스토리 조회 | InfluxDB 기반 시계열 데이터 |
| 🎥 **카메라** | 원격 제어 | 라즈베리파이 카메라 촬영/모니터링 |
| 🤖 **AI 분석** | YOLO 토마토 분석 | 4-class 분류 (Ready, Not_Ready, Disease_Bad, Truss) |
| 💬 **AI 챗봇** | 농업 컨설팅 | Gemini API 기반 전문 상담 |
| 🦠 **병해충 진단** | AI 진단 | Gemini Vision 기반 병해충 분석 |
| 💰 **시장 가격** | 도매가/온라인가 | KAMIS + 네이버 쇼핑 연동 |
| 🌱 **수확량 예측** | ML 예측 | Random Forest 모델 (R² = 0.9084) |
| 📝 **농장 일지** | 기록 관리 | 일별 데이터 + 메모 저장 |

## 🛠 기술 스택

- **Workflow Engine**: n8n
- **Database**: InfluxDB (시계열), PostgreSQL (메타데이터)
- **AI/ML**: YOLOv8, Gemini API, scikit-learn
- **API Documentation**: Swagger/OpenAPI 3.0
- **Infrastructure**: Docker, nginx

## 🌐 서버 환경

| 환경 | URL | 용도 |
|-----|-----|-----|
| **운영 서버** | http://seedfarm.co.kr:5678 | 외부 접근용 |
| **내부 서버** | http://192.168.49.101:5679 | 사내망 전용 |
| **YOLO 서버** | http://192.168.49.101:8001 | 이미지 분석 |
| **수확량 예측** | http://192.168.49.101:8002 | ML 예측 |
| **InfluxDB** | http://192.168.49.101:8086 | 데이터 저장 |

## 📚 API 문서

Swagger UI를 통해 대화형 API 문서를 확인할 수 있습니다:

**Swagger UI**: http://seedfarm.co.kr:5678/api-docs

## 📂 프로젝트 구조

```
tomato-smartfarm-api/
├── swagger/
│   └── swagger.yaml          # OpenAPI 3.0 스펙 정의
├── api/
│   └── tomatoApi.js          # 프론트엔드용 API 클라이언트
├── swagger-server.js         # Swagger UI 서버
├── README.md                 # 프로젝트 문서
└── package.json              # 프로젝트 메타데이터
```

---

## 📤 이미지 업로드 방식

### 엔드포인트별 방식 요약

| 엔드포인트 | 방식 | Content-Type | 대상 서버 |
|-----------|------|--------------|----------|
| `/capture-analyze` | **FormData** | `multipart/form-data` | YOLO 서버 |
| `/disease-diagnosis` | **Base64** | `application/json` | Gemini Vision API |

### 왜 다른 방식을 사용하나?

| 항목 | `/capture-analyze` | `/disease-diagnosis` |
|------|-------------------|---------------------|
| 대상 | YOLO 서버 | Gemini Vision API |
| 서버 요구사항 | FormData 필수 | Base64 필수 |
| 데이터 크기 | 작음 (원본) | 큼 (+33%) |
| 처리 속도 | 빠름 | 느림 |

- **YOLO 서버**: `multipart/form-data`로 파일을 직접 받음
- **Gemini API**: JSON body에 `inline_data.data`로 Base64 이미지 필요

---

## 🔌 API 엔드포인트 요약

### 📊 Data (데이터 조회)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/webhook/data-realtime` | 실시간 토마토 분석 데이터 |
| GET | `/webhook/data-history?hours=24` | 과거 데이터 (시간별) |
| GET | `/webhook/data-summary` | 오늘 일일 요약 |

### 🎥 Camera (카메라 제어)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/webhook/camera-capture` | 즉시 촬영 및 분석 |
| POST | `/webhook/capture-test` | 테스트 촬영 (개발용) |
| POST | `/webhook/camera-start` | 자동 모니터링 시작 |
| POST | `/webhook/camera-stop` | 자동 모니터링 중지 |
| GET | `/webhook/camera-status` | 카메라 상태 조회 |
| POST | `/webhook/camera-interval` | 촬영 간격 설정 |
| POST | `/webhook/camera-white-balance` | 화이트밸런스 설정 |

### 🤖 AI (인공지능)

| Method | Endpoint | Content-Type | Description |
|--------|----------|--------------|-------------|
| POST | `/webhook/chat-message` | `multipart/form-data` | AI 챗봇 메시지 (텍스트/이미지) |
| POST | `/webhook/capture-analyze` | `multipart/form-data` | 이미지 YOLO 분석 **(FormData)** |
| POST | `/webhook/disease-diagnosis` | `application/json` | 병해충 AI 진단 **(Base64)** |
| POST | `/webhook/raspberry-image` | `multipart/form-data` | 라즈베리파이 이미지 수신 |

### 💰 Market (시장 가격)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/webhook/market-price` | 실시간 시장 가격 |
| GET | `/webhook/price-compare` | 도매가 vs 온라인가 비교 |
| GET | `/webhook/price-history?start=&end=` | 가격 추이 조회 |

### 🌱 Prediction (수확량 예측)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/webhook/yield-prediction` | 수확량 예측 |

### 📝 Diary (농장 일지)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/webhook/app/diary?days=7` | 일지 목록 조회 |
| POST | `/webhook/app/diary` | 일지 저장 |

### 🏠 Home (앱 홈 화면)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/webhook/app/home` | 홈 화면 통합 데이터 |
| POST | `/webhook/app/chat` | 앱용 간편 채팅 |
| POST | `/webhook/app/analyze` | 앱용 이미지 분석 |

---

## 📝 사용 예제

### 1. 실시간 데이터 조회

```bash
curl -X GET "http://seedfarm.co.kr:5678/webhook/data-realtime"
```

**응답:**
```json
{
  "Ready": 45,
  "Not_Ready": 23,
  "Disease_Bad": 2,
  "Truss": 8
}
```

### 2. 즉시 촬영 및 분석

```bash
curl -X POST "http://seedfarm.co.kr:5678/webhook/camera-capture"
```

**응답:**
```json
{
  "success": true,
  "data": {
    "Ready": 35,
    "Not_Ready": 18,
    "Disease_Bad": 2,
    "Truss": 6,
    "ripeness_rate": 66,
    "disease_rate": 4
  },
  "timestamp": "2024-11-21T07:30:00Z"
}
```

### 3. YOLO 이미지 분석 (FormData)

```bash
curl -X POST "http://seedfarm.co.kr:5678/webhook/capture-analyze" \
  -F "image=@tomato.jpg"
```

**JavaScript:**
```javascript
const formData = new FormData();
formData.append('image', imageFile);

const response = await fetch('/webhook/capture-analyze', {
  method: 'POST',
  body: formData
});
```

**응답:**
```json
{
  "success": true,
  "message": "YOLO 분석 완료",
  "timestamp": "2024-12-04T10:30:00.000Z",
  "data": {
    "Ready": 15,
    "Not_Ready": 8,
    "Disease_Bad": 2,
    "Truss": 5,
    "total_fruit": 23,
    "ripeness_rate": 65,
    "disease_rate": 8
  }
}
```

### 4. 병해충 진단 (Base64)

```bash
# Base64 인코딩
BASE64_IMAGE=$(base64 -i tomato.jpg)

curl -X POST "http://seedfarm.co.kr:5678/webhook/disease-diagnosis" \
  -H "Content-Type: application/json" \
  -d "{\"image\": \"$BASE64_IMAGE\", \"mimeType\": \"image/jpeg\"}"
```

**JavaScript:**
```javascript
// 이미지를 Base64로 변환하는 헬퍼 함수
const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

// API 호출
const base64Image = await blobToBase64(imageFile);

const response = await fetch('/webhook/disease-diagnosis', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    image: base64Image,
    mimeType: 'image/jpeg'
  })
});
```

**응답:**
```json
{
  "success": true,
  "diagnosis": "## 🚦 건강 상태 평가\n**주의** - 잎에 초기 증상이 관찰됩니다...\n\n### 🔍 발견된 증상\n- 잎 표면에 갈색 반점...",
  "healthStatus": "주의",
  "timestamp": "2024-12-04T10:30:00.000Z"
}
```

### 5. AI 챗봇 질문

```bash
curl -X POST "http://seedfarm.co.kr:5678/webhook/chat-message" \
  -H "Content-Type: multipart/form-data" \
  -F "message=현재 온도 25도, 습도 70%일 때 예상 수확량은?"
```

### 6. 수확량 예측

```bash
curl -X POST "http://seedfarm.co.kr:5678/webhook/yield-prediction" \
  -H "Content-Type: application/json" \
  -d '{
    "month": 11,
    "temperature": 25.5,
    "humidity": 70,
    "co2": 800,
    "solar_radiation": 1500,
    "growth_stage": "생육중기(11~12월)",
    "facility_type": "비닐하우스"
  }'
```

**응답:**
```json
{
  "predicted_yield": 8.52,
  "confidence_interval": {
    "lower": 7.89,
    "upper": 9.15,
    "std_dev": 0.42
  },
  "recommendations": [
    "현재 환경이 적정 범위입니다",
    "CO2 농도를 800-1000ppm으로 유지하세요"
  ]
}
```

### 7. 시장 가격 비교

```bash
curl -X GET "http://seedfarm.co.kr:5678/webhook/price-compare"
```

**응답:**
```json
{
  "success": true,
  "date": "2024-11-21",
  "wholesale_summary": {
    "high": 3500,
    "mid": 2800,
    "cherry": 8500
  },
  "online_summary": {
    "lowest_price": 4200,
    "lowest_mall": "쿠팡",
    "median_price": 5500,
    "average_price": 5800
  },
  "comparison": [
    {
      "grade": "상품",
      "wholesale_price": 3500,
      "online_lowest": 4200,
      "margin_rate": 20
    }
  ]
}
```

---

## 🔧 n8n 워크플로우 구조

### /capture-analyze (YOLO 분석)
```
Webhook (FormData)
    ↓
필드명 매핑1 (바이너리 → 'data')
    ↓
YOLO 분석2 (HTTP Request → YOLO 서버)
    ↓
결과 파싱 및 저장 (InfluxDB 저장)
```

### /disease-diagnosis (병해충 진단)
```
Webhook_병해충진단 (Base64 JSON)
    ↓
프롬프트_생성 (이미지 + 프롬프트 구성)
    ↓
Chat_병해충진단 (LangChain)
    ↓
Gemini_모델 (AI 분석)
    ↓
응답_파싱 → 응답_반환
```

### 전체 아키텍처

```
┌─────────────────────────────────────────────────┐
│                   n8n Webhooks                  │
├─────────────────────────────────────────────────┤
│ data-realtime, data-history, data-summary       │
│ camera-capture, camera-start, camera-stop, etc. │
│ chat-message, capture-analyze, disease-diagnosis│
│ market-price, price-compare, price-history      │
│ yield-prediction, app/diary, app/home           │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│              Backend Services                    │
├─────────────────────────────────────────────────┤
│ • YOLO Server (8001) - 이미지 분석              │
│ • Yield Server (8002) - 수확량 예측             │
│ • InfluxDB (8086) - 시계열 데이터               │
│ • PostgreSQL (5432) - 최적 환경 데이터          │
│ • Gemini API - AI 챗봇 & 병해충 진단            │
│ • KAMIS API - 시장 가격                         │
│ • 네이버 쇼핑 API - 온라인 가격                 │
└─────────────────────────────────────────────────┘
```

---

## 🔑 데이터 필드 설명

### 토마토 분석 결과 (YOLO 4-class)

| 필드 | 한글명 | 설명 |
|------|--------|------|
| `Ready` | 수확 가능 | 완숙 토마토 개수 |
| `Not_Ready` | 미성숙 | 아직 익지 않은 토마토 |
| `Disease_Bad` | 병해 | 병해충 감염 토마토 |
| `Truss` | 화방 | 꽃봉우리/꽃송이 개수 |

### 앱용 필드명 매핑

프론트엔드 앱에서는 소문자 필드명을 사용합니다:

| API 응답 | 앱 사용 |
|---------|---------|
| `Ready` | `ready` |
| `Not_Ready` | `not_ready` |
| `Disease_Bad` | `disease` |
| `Truss` | `truss` |

`/webhook/app/home` 엔드포인트는 이미 소문자로 매핑되어 반환됩니다.

---

## ⚠️ 주의사항

1. **CORS**: 운영 서버는 nginx 리버스 프록시를 통해 CORS가 처리됩니다.

2. **이미지 업로드**: 
   - `/capture-analyze`: `multipart/form-data` (FormData)
   - `/disease-diagnosis`: `application/json` (Base64)

3. **날짜/시간**: 모든 timestamp는 ISO 8601 형식 (UTC)입니다.

4. **에러 처리**: 모든 응답에 `success` 필드가 포함됩니다.

---

## 📄 라이선스

ISC

## 👥 기여자

SEED FARM 개발팀

## 📞 문의

이슈가 있으시면 개발팀에 문의해주세요.

---

**마지막 업데이트**: 2025-12-04