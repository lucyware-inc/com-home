-- ============================================================================
-- 홈페이지 문의 접수 테이블
--
-- **이 파일은 사람이 실행한다.** Claude 는 DB 에 붙지 않는다.
-- 검토하고 이름·타입을 고친 뒤 직접 실행한다.
--
-- ----------------------------------------------------------------------------
-- 확인이 필요한 것 — 실행 전에 정한다
--
--  1. 테이블 이름. 여기 `CRM_INQ` 는 **제안이지 표준이 아니다.**
--     이름 표준은 metadrag 가 들고 있으므로 주제영역·테이블유형 접두사를
--     그쪽 규칙으로 바꾼다. 이름은 아래 CREATE 한 줄에만 나온다.
--  2. 문자셋·콜레이션이 다른 테이블과 같은지.
--  3. 처리상태·문의유형 코드를 코드마스터에 등록할지, 이 테이블 안에서만 쓸지.
--     **SYS_* · COM_* 공통 테이블은 건드리지 않는다** — 다른 시스템의 화면과
--     쿼리가 조용히 깨진다. 등록이 필요하면 따로 이야기한다.
--  4. 보관기간. 아래 주석의 3년은 **제안이며 확정값이 아니다.**
--
-- ----------------------------------------------------------------------------
-- 설계 메모 — 왜 이렇게 잡았는가
--
--  * **문의유형을 화면 글자가 아니라 코드로 저장한다.** 지금 폼은 언어에 따라
--    option 의 value 가 바뀐다(`data-en-value`). 그 값을 그대로 넣으면 같은
--    문의유형이 「PoC · 데모 신청」 과 「PoC · Demo request」 두 값으로 쌓여,
--    나중에 유형별로 세는 것이 불가능해진다. 폼을 코드로 고치는 것이 함께
--    필요하다.
--  * **처리상태를 둔다.** 「이력관리」 의 핵심이 이것이다. 접수만 쌓이고 처리
--    여부가 남지 않으면 메일함과 다를 것이 없다.
--  * **동의 사실을 행 안에 남긴다.** 개인정보를 받아 두고 동의 증빙이 없으면
--    나중에 증명할 방법이 없다. 동의 여부와 동의 시각을 함께 적는다.
--  * **누가 넣은 행인지 구분된다.** 이 테이블은 홈페이지가 자동으로 넣는다 —
--    사람이 나중에 손으로 넣거나 다른 채널이 생겨도 REG_CHNL_CD 로 갈린다.
--  * IP 는 스팸 추적에 쓸모가 있으나 **그 자체가 개인정보다.** 수집 항목에
--    적어 동의를 받아야 한다. 필요 없다고 판단되면 컬럼째로 뺀다.
-- ============================================================================

CREATE TABLE CRM_INQ (
    INQ_ID          BIGINT       NOT NULL AUTO_INCREMENT  COMMENT '문의번호',
    RCPT_DTM        DATETIME     NOT NULL                 COMMENT '접수일시',

    -- 방문자가 입력하는 값
    CORP_NM         VARCHAR(100) NOT NULL                 COMMENT '회사기관명',
    MGR_NM          VARCHAR(50)  NOT NULL                 COMMENT '담당자명',
    EMAIL           VARCHAR(255) NOT NULL                 COMMENT '이메일',
    TEL_NO          VARCHAR(30)      NULL                 COMMENT '연락처',
    INQ_TYPE_CD     VARCHAR(20)  NOT NULL                 COMMENT '문의유형코드',
    INQ_CNTN        TEXT         NOT NULL                 COMMENT '문의내용',

    -- 답장을 어느 언어로 보낼지 판단하는 값
    LANG_CD         CHAR(2)      NOT NULL DEFAULT 'ko'    COMMENT '작성언어코드',

    -- 개인정보 동의 증빙
    PRVC_AGR_YN     CHAR(1)      NOT NULL DEFAULT 'N'     COMMENT '개인정보동의여부',
    PRVC_AGR_DTM    DATETIME         NULL                 COMMENT '개인정보동의일시',

    -- 처리 이력
    PROC_STAT_CD    VARCHAR(20)  NOT NULL DEFAULT 'RCPT'  COMMENT '처리상태코드',
    PROC_MEMO       TEXT             NULL                 COMMENT '처리메모',
    PROC_DTM        DATETIME         NULL                 COMMENT '처리일시',

    -- 유입 정보. CLNT_IP 는 개인정보이므로 수집 항목에 반드시 포함시킨다
    REG_CHNL_CD     VARCHAR(20)  NOT NULL DEFAULT 'HOMEPAGE' COMMENT '등록채널코드',
    CLNT_IP         VARCHAR(45)      NULL                 COMMENT '접속아이피',
    REFERER_URL     VARCHAR(500)     NULL                 COMMENT '유입경로주소',

    REG_DTM         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '등록일시',
    UPD_DTM         DATETIME         NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',

    PRIMARY KEY (INQ_ID),
    KEY IX_CRM_INQ_01 (RCPT_DTM),
    KEY IX_CRM_INQ_02 (PROC_STAT_CD, RCPT_DTM),
    KEY IX_CRM_INQ_03 (EMAIL)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COMMENT = '홈페이지문의';


-- ----------------------------------------------------------------------------
-- 코드값 — 코드마스터에 등록하지 않고 이 테이블 안에서만 쓸 경우의 약속.
-- 등록하기로 정하면 이 주석을 지우고 코드마스터를 참조한다.
--
--  INQ_TYPE_CD   POC        PoC · 데모 신청
--                METADRAG   MetaDRAG® 도입 문의
--                LUCYWAREAI Lucyware.AI 도입 문의
--                FLEXELF    flexelf™ 문의
--                UBIQLOUD   ubiQloud 문의
--                UBIQATION  ubiQation 문의
--                SI         SI · 컨설팅 문의
--                RECRUIT    채용 · 제휴
--                ETC        기타
--
--  PROC_STAT_CD  RCPT       접수
--                CHECKED    확인
--                REPLIED    답변완료
--                CLOSED     종결
--                SPAM       스팸
--
--  LANG_CD       ko / en
--  REG_CHNL_CD   HOMEPAGE   홈페이지 문의 폼
-- ----------------------------------------------------------------------------


-- ----------------------------------------------------------------------------
-- 웹에서 쓸 계정 — **이 테이블에 INSERT 만 되게 한다.**
--
-- 공개된 폼에서 들어오는 경로다. 그 계정으로 다른 테이블을 읽을 수 있으면,
-- 엔드포인트 하나가 뚫렸을 때 사고 범위가 DB 전체가 된다.
-- 조회는 사람이 DBeaver 로 하거나 나중에 관리 화면에서 별도 계정으로 한다.
--
-- 아래는 예시다. 계정명·비밀번호·접속 대역은 사람이 정한다.
-- 비밀번호를 이 파일에 적어 커밋하지 않는다.
-- ----------------------------------------------------------------------------

-- CREATE USER 'lucyware_web'@'<접속대역>' IDENTIFIED BY '<비밀번호>';
-- GRANT INSERT ON <스키마>.CRM_INQ TO 'lucyware_web'@'<접속대역>';
-- FLUSH PRIVILEGES;
