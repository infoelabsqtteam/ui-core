export enum EndPoint {

    GET_USER_PERMISSION = "user/utvn/v2",
    SAVE_CUSTOM_TEMPLATE = "ins/save/templates",
    SAVE_FORM_DATA = "ins/save",
    DELETE_GRID_ROW = "del/delete",
    SEND_EMAIL = "ins/send_mail",
    GET_CUSTOM_TEMPLATE = "rpts/sobj",
    GET_GRID_DATA = "rpts/gd",
    GET_COUNT_DATA = "rpts/gd_list",
    GET_TEMPLATE_NAMES = "template/names",
    EXPORT_GRID_DATA = "downloads/excelExport",
    CSV_EXPORT_GRID_DATA = "downloads/csvExport",
    SAVE_NAVIGATION = "ins/save/navigation",
    SAVE_PERMISSION = "ins/save/permissions",
    GET_STATIC_DATA = "rpts/gsd",
    SAVE_QUOTE = "ins/save/request_qoute",
    AUTH_SIGNIN = "login/si/",
    AUTH_SIGNUP = "login/su/",
    AU_SIGNIN = "login/signIn",
    AU_SIGNUP = "login/signUp",
    USER_VARIFY = "login/verify",
    AUTH_SIGNOUT = "login/signOut",
    AUTH_FORGET_PASSWORD = "login/fp",
    AUTH_RESET_PASSWORD = "login/rp",
    AUTH_CHANGE_PASSWORD = "login/cp",
    TWO_FACTOR_AUTHENTICATION = "login/tfa",
    GET_AUTH_APP = "user/auth/app/",
    SAVE_CONTACT_US = "ins/save/contact_us_query",
    SAVE_CAREER_WITH_US = "ins/save/career_with_us",
    GET_PREVIEW_HTML = "rpts/get_html",
    GET_PARAMETER_LIST = "qt/sobj",
    SAVE_PARAMETER_LIST = "qt/popbranch",
    GET_PDF = "rpts/get_pdf",
    GET_PUBLIC_PDF = "get_pdf",
    DOWNLOAD_PDF = "rpts/getfl",
    PATAINT_REPORT = "get_report",
    GET_CHART_DATA = "rpts/get_chart_data",
    GET_FORM = "rpts/get_form",
    GET_FORM_PUBLIC = 'get_form',
    GET_FILE = "rpts/get_file",
    RESET_PASSWORD = "login/cnp",
    GET_DASHLET_DATA = "generic/retrieve/dashlet_data",
    OTP_VARIFICATION = "login/confirmUserWithToken/",
    GET_COMPARE_DATA = "mig/send_menu_by_module/",
    GET_QR_CODE = "rpts/qrGen/",
    PUBLIC = "public/",
    //GET_VDR_DATA = "vdrn/getrtf/e",
    GET_VDR_DATA = "vdrn/getRefCodeRootFolderForAppId/e",
    MOVE_FOLDER_CHILD = "vdrn/getch",
    UPLOAD_DOC_FILE = "vdrn/crtfl/e",
    INSERT_FILE_AFTER_UPLOAD = "vdrn/crtflaftupl/e",
    CREATE_FOLDER = "vdrn/crtfd/e",
    GET_CHILD_FOLDER_BY_KEY = "vdrn/getchbk",
    GET_DOC_AUDIT = "vdrn/getAudit/",
    DOC_FILE_DOWNLOAD = "vdrn/getfl/download",
    SET_DOC_FILE_AUDIT_AFTER_DOWNLOAD="vdrn/setflaud/download",
    DOC_FILE_VIEW = "vdrn/getfl/view",
    DOC_DELETE = "vdrn/fo/",
    DOC_SHARE = "vdrn/shr",
    GET_FOLDER_BY_KEY = "vdrn/getS3FolderDataByKey",
    GIT_VERSION = "git/version",
    DOC_PERMISSION = 'vdrn/svper',
    AUDIT_HISTORY = "getAuditHistory",
    AUDIT_VERSION_LIST = "getAuditVersionList",
    DOWNLOAD_MANUAL= "s3/getSignedS3Url",
    GET_NOTIFICATION_SETTING= "rpts/getNotification"
}
