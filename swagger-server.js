/**
 * 토마토 스마트팜 API Swagger 서버 v2.0
 * 
 * n8n 워크플로우 기반 API 문서화 서버입니다.
 * 실제 API 요청은 n8n 서버(n8n.seedfarm.co.kr)로 전달됩니다.
 * 
 * FormData(multipart/form-data) 파일 업로드를 지원합니다.
 * 
 * 변경사항 (v2.0):
 * - 서버 URL: seedfarm.co.kr:5678 → n8n.seedfarm.co.kr
 * - 지식베이스 연동 (농촌진흥청 자료)
 */

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const FormData = require('form-data');

const app = express();
const PORT = process.env.PORT || 3300;
const N8N_BASE_URL = process.env.N8N_URL || 'https://n8n.seedfarm.co.kr/webhook';

// Multer 설정 (메모리 저장)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB 제한
});

// CORS 설정
app.use(cors());

// JSON 파싱
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Swagger 문서 로드
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger', 'swagger.yaml'));

// Swagger UI 옵션
const swaggerOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #e53935; }
    .swagger-ui .info .title::before { content: "🍅 "; }
  `,
  customSiteTitle: "토마토 스마트팜 API v2.0",
  customfavIcon: "https://em-content.zobj.net/source/apple/354/tomato_1f345.png"
};

// Swagger UI 라우트
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));

// 헬스체크
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    version: '2.0.0',
    message: '토마토 스마트팜 API 문서 서버',
    swagger_ui: `http://localhost:${PORT}/api-docs`,
    api_server: N8N_BASE_URL,
    features: {
      knowledge_base: '농촌진흥청 농업기술길잡이 106 (병해 8종, 해충 6종, 영양장애 10종, 생리장해 18종)',
      yolo_analysis: '4-class 토마토 분류 (Ready, Not_Ready, Disease_Bad, Truss)',
      yield_prediction: 'Random Forest 모델 (R² = 0.9084)'
    },
    endpoints: {
      capture_analyze: `POST ${N8N_BASE_URL}/capture-analyze`,
      disease_diagnosis: `POST ${N8N_BASE_URL}/disease-diagnosis`,
      chat_message: `POST ${N8N_BASE_URL}/chat-message`
    }
  });
});

// OpenAPI JSON 엔드포인트
app.get('/api-docs.json', (req, res) => {
  res.json(swaggerDocument);
});

// ============================================================
// 프록시 엔드포인트 (Swagger UI에서 테스트용)
// ============================================================

/**
 * FormData 프록시 헬퍼 함수
 * multer로 받은 파일을 n8n 서버로 전달
 */
async function proxyFormData(req, res, targetPath) {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: '이미지 파일이 필요합니다. FormData의 "image" 필드에 파일을 첨부해주세요.' 
      });
    }

    // FormData 생성
    const formData = new FormData();
    formData.append('image', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    // n8n 서버로 전달
    const response = await fetch(`${N8N_BASE_URL}${targetPath}`, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    const data = await response.json();
    res.status(response.status).json(data);

  } catch (error) {
    console.error(`프록시 오류 (${targetPath}):`, error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      hint: 'n8n 서버에 연결할 수 없습니다. 서버 상태를 확인해주세요.'
    });
  }
}

/**
 * POST /proxy/capture-analyze
 * YOLO 토마토 분석 프록시 (FormData)
 */
app.post('/proxy/capture-analyze', upload.single('image'), (req, res) => {
  proxyFormData(req, res, '/capture-analyze');
});

/**
 * POST /proxy/disease-diagnosis
 * 병해충 AI 진단 프록시 (Base64 JSON)
 */
app.post('/proxy/disease-diagnosis', async (req, res) => {
  try {
    const { image, mimeType } = req.body;
    
    if (!image) {
      return res.status(400).json({ 
        success: false, 
        error: 'Base64 인코딩된 이미지가 필요합니다. JSON body의 "image" 필드를 확인해주세요.' 
      });
    }

    // n8n 서버로 JSON 전달
    const response = await fetch(`${N8N_BASE_URL}/disease-diagnosis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: image,
        mimeType: mimeType || 'image/jpeg'
      })
    });

    const data = await response.json();
    res.status(response.status).json(data);

  } catch (error) {
    console.error('프록시 오류 (disease-diagnosis):', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      hint: 'n8n 서버에 연결할 수 없습니다. 서버 상태를 확인해주세요.'
    });
  }
});

/**
 * POST /proxy/chat-message
 * AI 챗봇 프록시 (지식베이스 연동)
 */
app.post('/proxy/chat-message', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        success: false, 
        error: '메시지가 필요합니다.' 
      });
    }

    const response = await fetch(`${N8N_BASE_URL}/chat-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    });

    const data = await response.json();
    res.status(response.status).json(data);

  } catch (error) {
    console.error('프록시 오류 (chat-message):', error);
    res.status(500).json({ 
      success: false, 
      error: error.message
    });
  }
});

/**
 * 범용 프록시 (JSON 요청)
 * GET/POST 요청을 n8n 서버로 전달
 */
app.all('/proxy/*', async (req, res) => {
  try {
    const targetPath = req.path.replace('/proxy', '');
    const url = `${N8N_BASE_URL}${targetPath}`;

    const options = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (req.method !== 'GET' && req.body) {
      options.body = JSON.stringify(req.body);
    }

    const response = await fetch(url, options);
    const data = await response.json();
    res.status(response.status).json(data);

  } catch (error) {
    console.error('프록시 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log('');
  console.log('🍅 토마토 스마트팜 API 문서 서버 v2.0');
  console.log('=====================================');
  console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
  console.log(`📄 OpenAPI JSON: http://localhost:${PORT}/api-docs.json`);
  console.log(`🔗 API 서버: ${N8N_BASE_URL}`);
  console.log('');
  console.log('📤 프록시 엔드포인트:');
  console.log(`   POST /proxy/capture-analyze    → YOLO 분석 (FormData)`);
  console.log(`   POST /proxy/disease-diagnosis  → 병해충 진단 (Base64 JSON)`);
  console.log(`   POST /proxy/chat-message       → AI 챗봇 (지식베이스 연동)`);
  console.log('');
  console.log('📖 지식베이스: 농촌진흥청 농업기술길잡이 106');
  console.log('   - 병해 8종, 해충 6종, 영양장애 10종, 생리장해 18종, 바이러스 3종');
  console.log('');
});