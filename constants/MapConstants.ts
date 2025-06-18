export const MAP_MESSAGES = {
  LOCATION_PERMISSION_DENIED_TITLE: 'Lỗi',
  LOCATION_PERMISSION_DENIED_MESSAGE: 'Quyền truy cập vị trí bị từ chối. Vui lòng cấp quyền trong cài đặt ứng dụng.',
  LOCATION_FETCH_ERROR_TITLE: 'Lỗi',
  LOCATION_FETCH_ERROR_MESSAGE: 'Không thể lấy vị trí hiện tại. Vui lòng kiểm tra cài đặt GPS và thử lại.',
  API_KEY_MISSING_TITLE: 'Lỗi API Key',
  API_KEY_MISSING_MESSAGE: 'OpenRouteService API Key chưa được cấu hình. Vui lòng kiểm tra biến môi trường EXPO_PUBLIC_ORS_API_KEY.',
  NO_ROUTE_FOUND_TITLE: 'Không có tuyến đường',
  NO_ROUTE_FOUND_MESSAGE: 'Không thể tìm thấy tuyến đường giữa hai điểm này. Có thể do địa điểm không khả dụng cho định tuyến.',
  ROUTE_CALCULATION_ERROR_TITLE: 'Lỗi tuyến đường',
  SEARCH_QUERY_EMPTY_TITLE: 'Lỗi tìm kiếm',
  SEARCH_QUERY_EMPTY_MESSAGE: 'Vui lòng nhập địa điểm cần tìm.',
  NO_CURRENT_LOCATION_TITLE: 'Lỗi',
  NO_CURRENT_LOCATION_MESSAGE: 'Không thể tìm kiếm khi không có vị trí hiện tại của bạn.',
  LOCATION_NOT_FOUND_TITLE: 'Không tìm thấy',
  LOCATION_NOT_FOUND_MESSAGE: (query: string) => `Không tìm thấy địa điểm "${query}". Vui lòng thử một tên khác, cụ thể hơn hoặc kiểm tra chính tả. Nominatim có thể không hỗ trợ đầy đủ các địa chỉ chi tiết ở Việt Nam.`,
  LOADING_LOCATION: 'Đang tải vị trí...',
  MAP_LOAD_ERROR: 'Không thể tải bản đồ do không có vị trí.',
  RETRY_PROMPT: 'Vui lòng khởi động lại ứng dụng hoặc cấp quyền vị trí để tiếp tục.',
  SEARCHING: 'Đang tìm kiếm...',
  RETRY_BUTTON_TEXT: 'Thử lại',
  CONFIRM_BUTTON_TEXT: 'OK',
  YOUR_LOCATION_MARKER_TITLE: 'Vị trí của bạn',
  DESTINATION_MARKER_TITLE: 'Điểm đến',
  SEARCH_PLACEHOLDER: 'Nhập địa điểm (ví dụ: Số 48 Bình Thới, P.14, Q.11)',
  SEARCH_BUTTON_TEXT: 'Tìm',
  
};

export const MAP_CONFIG = {
  NOMINATIM_USER_AGENT: 'ReactNativeMapApp/1.0 (luukaka2211@gmail.com)', // Thay thế bằng email của bạn
  NOMINATIM_BASE_URL: 'https://nominatim.openstreetmap.org/search',
  ORS_DIRECTIONS_BASE_URL: 'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
  DEFAULT_CITY: 'Hồ Chí Minh',
  DEFAULT_COUNTRY: 'Việt Nam',
  LOCATION_DELTA_SEARCH_BOX: 0.1, // Giá trị delta cho viewbox tìm kiếm vị trí
  MAP_INITIAL_LATITUDE_DELTA: 0.01,
  MAP_INITIAL_LONGITUDE_DELTA: 0.01,
  ROUTE_STROKE_WIDTH: 5,
  MAP_FIT_EDGE_PADDING: { top: 100, right: 50, bottom: 50, left: 50 },
};

export const PLACEHOLDER_EXAMPLE = "Số 48 Bình Thới, P.14, Q.11"; // Ví dụ địa điểm