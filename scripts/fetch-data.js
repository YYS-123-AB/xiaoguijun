import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, '..', 'data', 'data.json');

const CATEGORIES = ['哲', '经', '法', '教', '文', '史', '理', '工', '农', '医', '管', '艺', '军'];
const CATEGORY_NAMES = {
  '哲': '哲学', '经': '经济学', '法': '法学', '教': '教育学',
  '文': '文学', '史': '历史学', '理': '理学', '工': '工学',
  '农': '农学', '医': '医学', '管': '管理学', '艺': '艺术学', '军': '军事学'
};
const HOT_TAGS = ['热门', '冷门', '国家特色', '新增'];

const MAJOR_TEMPLATES = {
  '哲': [
    { name: '哲学', code: '010101', degree: '学士', years: 4 },
    { name: '逻辑学', code: '010102', degree: '学士', years: 4 },
    { name: '宗教学', code: '010103', degree: '学士', years: 4 },
    { name: '伦理学', code: '010104', degree: '学士', years: 4 },
    { name: '美学', code: '010105', degree: '学士', years: 4 },
    { name: '外国哲学', code: '010106', degree: '学士', years: 4 },
    { name: '中国哲学', code: '010107', degree: '学士', years: 4 },
    { name: '科学技术哲学', code: '010108', degree: '学士', years: 4 },
    { name: '马克思主义哲学', code: '010109', degree: '学士', years: 4 },
    { name: '宗教学原理', code: '010110', degree: '学士', years: 4 },
    { name: '哲学思辨与人工智能伦理', code: '010111', degree: '学士', years: 4 },
    { name: '现代逻辑与哲学', code: '010112', degree: '学士', years: 4 },
    { name: '哲学创新班', code: '010113', degree: '学士', years: 4 },
    { name: '比较哲学', code: '010114', degree: '学士', years: 4 },
    { name: '政治哲学', code: '010115', degree: '学士', years: 4 },
    { name: '哲学基础理论', code: '010116', degree: 'associate', years: 3 }
  ],
  '经': [
    { name: '经济学', code: '020101', degree: '学士', years: 4 },
    { name: '经济统计学', code: '020102', degree: '学士', years: 4 },
    { name: '财政学', code: '020201', degree: '学士', years: 4 },
    { name: '税收学', code: '020202', degree: '学士', years: 4 },
    { name: '金融学', code: '020301', degree: '学士', years: 4 },
    { name: '金融工程', code: '020302', degree: '学士', years: 4 },
    { name: '保险学', code: '020303', degree: '学士', years: 4 },
    { name: '投资学', code: '020304', degree: '学士', years: 4 },
    { name: '国际经济与贸易', code: '020401', degree: '学士', years: 4 },
    { name: '贸易经济', code: '020402', degree: '学士', years: 4 },
    { name: '国民经济管理', code: '020103', degree: '学士', years: 4 },
    { name: '资源与环境经济学', code: '020104', degree: '学士', years: 4 },
    { name: '商务经济学', code: '020105', degree: '学士', years: 4 },
    { name: '能源经济', code: '020106', degree: '学士', years: 4 },
    { name: '劳动经济学', code: '020107', degree: '学士', years: 4 },
    { name: '互联网金融', code: '020305', degree: '学士', years: 4 },
    { name: '经济与金融', code: '020306', degree: 'associate', years: 3 },
    { name: '国际商务', code: '020403', degree: 'associate', years: 3 }
  ],
  '法': [
    { name: '法学', code: '030101', degree: '学士', years: 4 },
    { name: '知识产权', code: '030102', degree: '学士', years: 4 },
    { name: '监狱学', code: '030103', degree: '学士', years: 4 },
    { name: '政治学与行政学', code: '030201', degree: '学士', years: 4 },
    { name: '国际政治', code: '030202', degree: '学士', years: 4 },
    { name: '外交学', code: '030203', degree: '学士', years: 4 },
    { name: '社会学', code: '030301', degree: '学士', years: 4 },
    { name: '社会工作', code: '030302', degree: '学士', years: 4 },
    { name: '人类学', code: '030303', degree: '学士', years: 4 },
    { name: '民族学', code: '030401', degree: '学士', years: 4 },
    { name: '马克思主义理论', code: '030501', degree: '学士', years: 4 },
    { name: '治安学', code: '030601', degree: '学士', years: 4 },
    { name: '侦查学', code: '030602', degree: '学士', years: 4 },
    { name: '边防管理', code: '030603', degree: '学士', years: 4 },
    { name: '禁毒学', code: '030604', degree: '学士', years: 4 },
    { name: '经济犯罪侦查', code: '030605', degree: '学士', years: 4 },
    { name: '法律事务', code: '030104', degree: 'associate', years: 3 },
    { name: '司法助理', code: '030105', degree: 'associate', years: 3 }
  ],
  '教': [
    { name: '教育学', code: '040101', degree: '学士', years: 4 },
    { name: '学前教育', code: '040102', degree: '学士', years: 4 },
    { name: '小学教育', code: '040103', degree: '学士', years: 4 },
    { name: '特殊教育', code: '040104', degree: '学士', years: 4 },
    { name: '体育教育', code: '040201', degree: '学士', years: 4 },
    { name: '运动训练', code: '040202', degree: '学士', years: 4 },
    { name: '社会体育指导与管理', code: '040203', degree: '学士', years: 4 },
    { name: '武术与民族传统体育', code: '040204', degree: '学士', years: 4 },
    { name: '汉语言文学教育', code: '040105', degree: '学士', years: 4 },
    { name: '英语教育', code: '040106', degree: '学士', years: 4 },
    { name: '数学教育', code: '040107', degree: '学士', years: 4 },
    { name: '科学教育', code: '040108', degree: '学士', years: 4 },
    { name: '人文教育', code: '040109', degree: '学士', years: 4 },
    { name: '教育技术学', code: '040110', degree: '学士', years: 4 },
    { name: '艺术教育', code: '040111', degree: '学士', years: 4 },
    { name: '运动人体科学', code: '040205', degree: '学士', years: 4 },
    { name: '学前教育专科', code: '040112', degree: 'associate', years: 3 },
    { name: '小学教育专科', code: '040113', degree: 'associate', years: 3 }
  ],
  '文': [
    { name: '汉语言文学', code: '050101', degree: '学士', years: 4 },
    { name: '汉语言', code: '050102', degree: '学士', years: 4 },
    { name: '汉语国际教育', code: '050103', degree: '学士', years: 4 },
    { name: '英语', code: '050201', degree: '学士', years: 4 },
    { name: '俄语', code: '050202', degree: '学士', years: 4 },
    { name: '法语', code: '050203', degree: '学士', years: 4 },
    { name: '德语', code: '050204', degree: '学士', years: 4 },
    { name: '西班牙语', code: '050205', degree: '学士', years: 4 },
    { name: '日语', code: '050206', degree: '学士', years: 4 },
    { name: '朝鲜语', code: '050207', degree: '学士', years: 4 },
    { name: '阿拉伯语', code: '050208', degree: '学士', years: 4 },
    { name: '新闻学', code: '050301', degree: '学士', years: 4 },
    { name: '广播电视学', code: '050302', degree: '学士', years: 4 },
    { name: '广告学', code: '050303', degree: '学士', years: 4 },
    { name: '传播学', code: '050304', degree: '学士', years: 4 },
    { name: '网络与新媒体', code: '050305', degree: '学士', years: 4 },
    { name: '翻译', code: '050209', degree: '学士', years: 4 },
    { name: '商务英语', code: '050210', degree: '学士', years: 4 },
    { name: '文秘', code: '050104', degree: 'associate', years: 3 }
  ],
  '史': [
    { name: '历史学', code: '060101', degree: '学士', years: 4 },
    { name: '世界史', code: '060102', degree: '学士', years: 4 },
    { name: '考古学', code: '060103', degree: '学士', years: 4 },
    { name: '文物与博物馆学', code: '060104', degree: '学士', years: 4 },
    { name: '文物保护技术', code: '060105', degree: '学士', years: 4 },
    { name: '文化遗产', code: '060106', degree: '学士', years: 4 },
    { name: '外国语言与外国历史', code: '060107', degree: '学士', years: 4 },
    { name: '中国共产党历史', code: '060108', degree: '学士', years: 4 },
    { name: '古典文献学', code: '060109', degree: '学士', years: 4 },
    { name: '民族学与历史学', code: '060110', degree: '学士', years: 4 },
    { name: '历史地理学', code: '060111', degree: '学士', years: 4 },
    { name: '史学理论与史学史', code: '060112', degree: '学士', years: 4 },
    { name: '历史文献学', code: '060113', degree: '学士', years: 4 },
    { name: '专门史', code: '060114', degree: '学士', years: 4 },
    { name: '中国古代史', code: '060115', degree: '学士', years: 4 },
    { name: '中国近现代史', code: '060116', degree: '学士', years: 4 },
    { name: '历史教育', code: '060117', degree: 'associate', years: 3 }
  ],
  '理': [
    { name: '数学与应用数学', code: '070101', degree: '学士', years: 4 },
    { name: '信息与计算科学', code: '070102', degree: '学士', years: 4 },
    { name: '物理学', code: '070201', degree: '学士', years: 4 },
    { name: '应用物理学', code: '070202', degree: '学士', years: 4 },
    { name: '化学', code: '070301', degree: '学士', years: 4 },
    { name: '应用化学', code: '070302', degree: '学士', years: 4 },
    { name: '生物科学', code: '071001', degree: '学士', years: 4 },
    { name: '生物技术', code: '071002', degree: '学士', years: 4 },
    { name: '地理科学', code: '070501', degree: '学士', years: 4 },
    { name: '自然地理与资源环境', code: '070502', degree: '学士', years: 4 },
    { name: '大气科学', code: '070601', degree: '学士', years: 4 },
    { name: '海洋科学', code: '070701', degree: '学士', years: 4 },
    { name: '地球物理学', code: '070801', degree: '学士', years: 4 },
    { name: '心理学', code: '071101', degree: '学士', years: 4 },
    { name: '应用心理学', code: '071102', degree: '学士', years: 4 },
    { name: '统计学', code: '071201', degree: '学士', years: 4 },
    { name: '应用统计学', code: '071202', degree: '学士', years: 4 },
    { name: '理论与应用力学', code: '070203', degree: '学士', years: 4 },
    { name: '数学教育专科', code: '070103', degree: 'associate', years: 3 }
  ],
  '工': [
    { name: '机械工程', code: '080201', degree: '学士', years: 4 },
    { name: '机械设计制造及其自动化', code: '080202', degree: '学士', years: 4 },
    { name: '材料成型及控制工程', code: '080203', degree: '学士', years: 4 },
    { name: '工业设计', code: '080205', degree: '学士', years: 4 },
    { name: '车辆工程', code: '080207', degree: '学士', years: 4 },
    { name: '测控技术与仪器', code: '080301', degree: '学士', years: 4 },
    { name: '材料科学与工程', code: '080401', degree: '学士', years: 4 },
    { name: '冶金工程', code: '080404', degree: '学士', years: 4 },
    { name: '能源与动力工程', code: '080501', degree: '学士', years: 4 },
    { name: '电气工程及其自动化', code: '080601', degree: '学士', years: 4 },
    { name: '电子信息工程', code: '080701', degree: '学士', years: 4 },
    { name: '通信工程', code: '080703', degree: '学士', years: 4 },
    { name: '自动化', code: '080801', degree: '学士', years: 4 },
    { name: '计算机科学与技术', code: '080901', degree: '学士', years: 4 },
    { name: '软件工程', code: '080902', degree: '学士', years: 4 },
    { name: '网络工程', code: '080903', degree: '学士', years: 4 },
    { name: '物联网工程', code: '080905', degree: '学士', years: 4 },
    { name: '土木工程', code: '081001', degree: '学士', years: 4 },
    { name: '水利水电工程', code: '081101', degree: '学士', years: 4 },
    { name: '化学工程与工艺', code: '081301', degree: '学士', years: 4 },
    { name: '环境工程', code: '082502', degree: '学士', years: 4 },
    { name: '建筑学', code: '082801', degree: '学士', years: 5 },
    { name: '城乡规划', code: '082802', degree: '学士', years: 4 },
    { name: '生物医学工程', code: '082601', degree: '学士', years: 4 },
    { name: '航空航天工程', code: '082001', degree: '学士', years: 4 },
    { name: '人工智能', code: '080717', degree: '学士', years: 4 },
    { name: '数据科学与大数据技术', code: '080910', degree: '学士', years: 4 },
    { name: '机器人工程', code: '080803', degree: '学士', years: 4 },
    { name: '计算机应用技术', code: '080904', degree: 'associate', years: 3 },
    { name: '机电一体化技术', code: '080204', degree: 'associate', years: 3 }
  ],
  '农': [
    { name: '农学', code: '090101', degree: '学士', years: 4 },
    { name: '园艺', code: '090102', degree: '学士', years: 4 },
    { name: '植物保护', code: '090103', degree: '学士', years: 4 },
    { name: '植物科学与技术', code: '090104', degree: '学士', years: 4 },
    { name: '种子科学与工程', code: '090105', degree: '学士', years: 4 },
    { name: '设施农业科学与工程', code: '090106', degree: '学士', years: 4 },
    { name: '动物科学', code: '090301', degree: '学士', years: 4 },
    { name: '动物医学', code: '090401', degree: '学士', years: 4 },
    { name: '林学', code: '090501', degree: '学士', years: 4 },
    { name: '园林', code: '090502', degree: '学士', years: 4 },
    { name: '水产养殖学', code: '090601', degree: '学士', years: 4 },
    { name: '海洋渔业科学与技术', code: '090602', degree: '学士', years: 4 },
    { name: '草业科学', code: '090701', degree: '学士', years: 4 },
    { name: '农业资源与环境', code: '090201', degree: '学士', years: 4 },
    { name: '野生动物与自然保护区管理', code: '090202', degree: '学士', years: 4 },
    { name: '水土保持与荒漠化防治', code: '090203', degree: '学士', years: 4 },
    { name: '农业工程', code: '082301', degree: '学士', years: 4 },
    { name: '食品科学与工程', code: '082701', degree: '学士', years: 4 },
    { name: '园艺技术', code: '090107', degree: 'associate', years: 3 },
    { name: '畜牧兽医', code: '090302', degree: 'associate', years: 3 }
  ],
  '医': [
    { name: '临床医学', code: '100201', degree: '学士', years: 5 },
    { name: '麻醉学', code: '100202', degree: '学士', years: 5 },
    { name: '医学影像学', code: '100203', degree: '学士', years: 5 },
    { name: '眼视光医学', code: '100204', degree: '学士', years: 5 },
    { name: '精神医学', code: '100205', degree: '学士', years: 5 },
    { name: '放射医学', code: '100206', degree: '学士', years: 5 },
    { name: '口腔医学', code: '100301', degree: '学士', years: 5 },
    { name: '预防医学', code: '100401', degree: '学士', years: 5 },
    { name: '食品卫生与营养学', code: '100402', degree: '学士', years: 4 },
    { name: '中医学', code: '100501', degree: '学士', years: 5 },
    { name: '针灸推拿学', code: '100502', degree: '学士', years: 5 },
    { name: '中西医临床医学', code: '100601', degree: '学士', years: 5 },
    { name: '药学', code: '100701', degree: '学士', years: 4 },
    { name: '药物制剂', code: '100702', degree: '学士', years: 4 },
    { name: '中药学', code: '100801', degree: '学士', years: 4 },
    { name: '法医学', code: '100901', degree: '学士', years: 5 },
    { name: '医学检验技术', code: '101001', degree: '学士', years: 4 },
    { name: '护理学', code: '101101', degree: '学士', years: 4 },
    { name: '护理', code: '101102', degree: 'associate', years: 3 },
    { name: '药学专科', code: '100703', degree: 'associate', years: 3 }
  ],
  '管': [
    { name: '管理科学', code: '120101', degree: '学士', years: 4 },
    { name: '信息管理与信息系统', code: '120102', degree: '学士', years: 4 },
    { name: '工程管理', code: '120103', degree: '学士', years: 4 },
    { name: '房地产开发与管理', code: '120104', degree: '学士', years: 4 },
    { name: '工商管理', code: '120201', degree: '学士', years: 4 },
    { name: '市场营销', code: '120202', degree: '学士', years: 4 },
    { name: '会计学', code: '120203', degree: '学士', years: 4 },
    { name: '财务管理', code: '120204', degree: '学士', years: 4 },
    { name: '人力资源管理', code: '120206', degree: '学士', years: 4 },
    { name: '行政管理', code: '120402', degree: '学士', years: 4 },
    { name: '公共事业管理', code: '120401', degree: '学士', years: 4 },
    { name: '劳动与社会保障', code: '120403', degree: '学士', years: 4 },
    { name: '土地资源管理', code: '120404', degree: '学士', years: 4 },
    { name: '物流管理', code: '120601', degree: '学士', years: 4 },
    { name: '物流工程', code: '120602', degree: '学士', years: 4 },
    { name: '工业工程', code: '120701', degree: '学士', years: 4 },
    { name: '电子商务', code: '120801', degree: '学士', years: 4 },
    { name: '旅游管理', code: '120901', degree: '学士', years: 4 },
    { name: '酒店管理', code: '120902', degree: '学士', years: 4 },
    { name: '会计', code: '120205', degree: 'associate', years: 3 },
    { name: '工商企业管理', code: '120207', degree: 'associate', years: 3 }
  ],
  '艺': [
    { name: '音乐表演', code: '130201', degree: '学士', years: 4 },
    { name: '音乐学', code: '130202', degree: '学士', years: 4 },
    { name: '作曲与作曲技术理论', code: '130203', degree: '学士', years: 4 },
    { name: '舞蹈表演', code: '130204', degree: '学士', years: 4 },
    { name: '舞蹈学', code: '130205', degree: '学士', years: 4 },
    { name: '舞蹈编导', code: '130206', degree: '学士', years: 4 },
    { name: '表演', code: '130301', degree: '学士', years: 4 },
    { name: '戏剧学', code: '130302', degree: '学士', years: 4 },
    { name: '电影学', code: '130303', degree: '学士', years: 4 },
    { name: '戏剧影视文学', code: '130304', degree: '学士', years: 4 },
    { name: '广播电视编导', code: '130305', degree: '学士', years: 4 },
    { name: '戏剧影视导演', code: '130306', degree: '学士', years: 4 },
    { name: '戏剧影视美术设计', code: '130307', degree: '学士', years: 4 },
    { name: '动画', code: '130310', degree: '学士', years: 4 },
    { name: '美术学', code: '130401', degree: '学士', years: 4 },
    { name: '绘画', code: '130402', degree: '学士', years: 4 },
    { name: '雕塑', code: '130403', degree: '学士', years: 4 },
    { name: '摄影', code: '130404', degree: '学士', years: 4 },
    { name: '视觉传达设计', code: '130502', degree: '学士', years: 4 },
    { name: '环境设计', code: '130503', degree: '学士', years: 4 },
    { name: '产品设计', code: '130504', degree: '学士', years: 4 },
    { name: '服装与服饰设计', code: '130505', degree: '学士', years: 4 },
    { name: '数字媒体艺术', code: '130508', degree: '学士', years: 4 },
    { name: '艺术设计', code: '130501', degree: 'associate', years: 3 },
    { name: '音乐教育专科', code: '130207', degree: 'associate', years: 3 }
  ],
  '军': [
    { name: '指挥信息系统工程', code: '110101', degree: '学士', years: 4 },
    { name: '雷达工程', code: '110102', degree: '学士', years: 4 },
    { name: '导弹工程', code: '110103', degree: '学士', years: 4 },
    { name: '作战信息管理', code: '110104', degree: '学士', years: 4 },
    { name: '军事思想与军事历史', code: '110105', degree: '学士', years: 4 },
    { name: '军队指挥学', code: '110106', degree: '学士', years: 4 },
    { name: '军事后勤学', code: '110107', degree: '学士', years: 4 },
    { name: '军事装备学', code: '110108', degree: '学士', years: 4 },
    { name: '国防经济', code: '110109', degree: '学士', years: 4 },
    { name: '外交与军事外交', code: '110110', degree: '学士', years: 4 },
    { name: '军事情报学', code: '110111', degree: '学士', years: 4 },
    { name: '军事密码学', code: '110112', degree: '学士', years: 4 },
    { name: '军事运筹学', code: '110113', degree: '学士', years: 4 },
    { name: '军事心理与心理战', code: '110114', degree: '学士', years: 4 },
    { name: '军用材料工程', code: '110115', degree: '学士', years: 4 },
    { name: '军事海洋水文气象', code: '110116', degree: '学士', years: 4 },
    { name: '军队政治工作学', code: '110117', degree: '学士', years: 4 },
    { name: '军事法学', code: '110118', degree: '学士', years: 4 },
    { name: '国防教育', code: '110119', degree: 'associate', years: 3 }
  ]
};

const UNIVERSITIES = [
  { name: '北京大学', level: '双一流/985/211', score: 680, isStrongBase: true },
  { name: '清华大学', level: '双一流/985/211', score: 685, isStrongBase: true },
  { name: '复旦大学', level: '双一流/985/211', score: 665, isStrongBase: true },
  { name: '上海交通大学', level: '双一流/985/211', score: 668, isStrongBase: true },
  { name: '浙江大学', level: '双一流/985/211', score: 660, isStrongBase: true },
  { name: '南京大学', level: '双一流/985/211', score: 655, isStrongBase: true },
  { name: '中国人民大学', level: '双一流/985/211', score: 658, isStrongBase: true },
  { name: '武汉大学', level: '双一流/985/211', score: 640, isStrongBase: false },
  { name: '中山大学', level: '双一流/985/211', score: 635, isStrongBase: false },
  { name: '西安交通大学', level: '双一流/985/211', score: 630, isStrongBase: true },
  { name: '华中科技大学', level: '双一流/985/211', score: 632, isStrongBase: false },
  { name: '四川大学', level: '双一流/985/211', score: 620, isStrongBase: false },
  { name: '北京航空航天大学', level: '双一流/985/211', score: 645, isStrongBase: true },
  { name: '同济大学', level: '双一流/985/211', score: 642, isStrongBase: false },
  { name: '北京师范大学', level: '双一流/985/211', score: 638, isStrongBase: true },
  { name: '华东师范大学', level: '双一流/985/211', score: 625, isStrongBase: false },
  { name: '厦门大学', level: '双一流/985/211', score: 622, isStrongBase: false },
  { name: '中国农业大学', level: '双一流/985/211', score: 605, isStrongBase: true },
  { name: '北京理工大学', level: '双一流/985/211', score: 633, isStrongBase: true },
  { name: '南开大学', level: '双一流/985/211', score: 636, isStrongBase: true },
  { name: '上海财经大学', level: '双一流/211', score: 640, isStrongBase: false },
  { name: '中央财经大学', level: '双一流/211', score: 638, isStrongBase: false },
  { name: '对外经济贸易大学', level: '双一流/211', score: 630, isStrongBase: false },
  { name: '北京科技大学', level: '双一流/211', score: 605, isStrongBase: false },
  { name: '南京理工大学', level: '双一流/211', score: 600, isStrongBase: false }
];

const INDUSTRIES_POOL = [
  '互联网/IT', '金融/银行/证券', '教育/培训/学术', '制造业/工程/建筑',
  '医疗/卫生/制药', '政府/机关/事业单位', '文化传媒/广告', '商业/零售/消费',
  '能源/环保/材料', '咨询/法律/会计'
];

const COURSES_POOL = [
  '高等数学', '大学英语', '大学物理', '计算机基础', '思想政治',
  '线性代数', '概率论与数理统计', '程序设计', '数据结构', '操作系统',
  '数据库原理', '计算机网络', '软件工程', '微观经济学', '宏观经济学',
  '管理学原理', '会计学基础', '市场营销学', '财务管理',
  '人力资源管理', '战略管理', '组织行为学', '统计学', '计量经济学',
  '货币银行学', '国际金融', '证券投资学', '保险学', '财政学',
  '民法学', '刑法学', '行政法学', '宪法学', '法理学',
  '教育学原理', '教育心理学', '课程与教学论', '中国教育史', '外国教育史',
  '古代汉语', '现代汉语', '文学概论', '中国古代文学', '中国现当代文学',
  '中国通史', '世界通史', '史学概论', '考古学通论', '博物馆学概论',
  '数学分析', '高等代数', '解析几何', '普通物理', '普通化学',
  '理论力学', '材料力学', '机械设计', '电路分析', '模拟电子技术',
  '植物学', '动物学', '微生物学', '生物化学', '遗传学',
  '人体解剖学', '生理学', '病理学', '药理学', '诊断学',
  '艺术概论', '美学原理', '素描', '色彩', '设计基础',
  '军事理论', '军事训练', '国防教育', '战略学', '战役学'
];

const CITIES = [
  { city: '北京', base: 18000 },
  { city: '上海', base: 17500 },
  { city: '深圳', base: 17000 },
  { city: '杭州', base: 14500 },
  { city: '广州', base: 14000 },
  { city: '南京', base: 12500 },
  { city: '苏州', base: 12000 },
  { city: '成都', base: 11000 },
  { city: '武汉', base: 10500 },
  { city: '西安', base: 9500 }
];

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom(arr, count) {
  return shuffle(arr).slice(0, count);
}

function generateCourses(category) {
  const specificMap = {
    '哲': ['哲学概论', '马克思主义哲学原理', '中国哲学史', '西方哲学史', '逻辑学', '伦理学', '宗教学', '美学原理', '现代西方哲学', '科学技术哲学', '宗教学概论', '中国哲学原著选读', '西方哲学原著选读', '现代逻辑', '价值哲学'],
    '经': ['政治经济学', '西方经济学', '计量经济学', '国际经济学', '货币银行学', '财政学', '会计学', '统计学', '管理学', '市场营销', '国际贸易', '国际金融', '证券投资学', '公司金融', '经济史'],
    '法': ['法理学', '宪法学', '民法学', '刑法学', '民事诉讼法学', '刑事诉讼法学', '行政法与行政诉讼法', '经济法', '商法', '知识产权法', '国际法', '国际私法', '国际经济法', '环境资源法', '劳动与社会保障法'],
    '教': ['教育学原理', '教育心理学', '中外教育史', '课程与教学论', '教育研究方法', '教育统计学', '教育哲学', '德育原理', '教育社会学', '教育经济学', '比较教育学', '教育管理学', '学前教育学', '普通心理学', '发展心理学'],
    '文': ['文学概论', '语言学概论', '古代汉语', '现代汉语', '中国古代文学', '中国现当代文学', '外国文学', '比较文学', '写作', '美学', '中国文化概论', '西方文论', '中国古典文献学', '语言学史', '批评理论'],
    '史': ['中国通史', '世界通史', '史学概论', '中国史学史', '西方史学史', '考古学通论', '历史文献学', '中国文化史', '世界文化史', '历史地理学', '中国政治制度史', '中国经济史', '中国思想史', '中西文化交流史', '史学论文写作'],
    '理': ['数学分析', '高等代数', '解析几何', '普通物理学', '普通化学', '普通生物学', '概率论与数理统计', '实变函数论', '复变函数论', '近世代数', '微分方程', '拓扑学', '微分几何', '泛函分析', '数学物理方程'],
    '工': ['高等数学', '大学物理', '工程制图', '理论力学', '材料力学', '机械原理', '机械设计', '电路分析', '模拟电子技术', '数字电子技术', '自动控制原理', '信号与系统', '数据结构', '操作系统', '计算机网络'],
    '农': ['植物学', '动物学', '微生物学', '生物化学', '遗传学', '植物生理学', '动物生理学', '土壤学', '农业气象学', '田间试验与统计方法', '农业生态学', '作物栽培学', '作物育种学', '植物保护学', '农业经济管理'],
    '医': ['人体解剖学', '组织胚胎学', '生理学', '生物化学', '病理学', '病理生理学', '药理学', '医学微生物学', '医学免疫学', '诊断学', '内科学', '外科学', '妇产科学', '儿科学', '医学伦理学'],
    '管': ['管理学原理', '经济学原理', '会计学', '财务管理', '市场营销', '人力资源管理', '运营管理', '战略管理', '管理信息系统', '统计学', '运筹学', '组织行为学', '管理经济学', '经济法', '生产与运作管理'],
    '艺': ['艺术概论', '美学原理', '中外艺术史', '素描', '色彩', '构成设计', '平面构成', '色彩构成', '立体构成', '专业技法', '创作基础', '艺术设计史', '艺术批评', '艺术心理学', '计算机辅助设计'],
    '军': ['军事理论', '军事思想', '军事历史', '战略学', '战役学', '战术学', '军队指挥学', '军制学', '军队政治工作学', '军事后勤学', '军事装备学', '国防经济学', '军事法学', '军事心理学', '军事运筹学']
  };
  const specific = specificMap[category] || [];
  const common = pickRandom(COURSES_POOL, 5);
  return [...pickRandom(specific, 12), ...pickRandom(common, 3)];
}

function generateOverview(name, category) {
  const catName = CATEGORY_NAMES[category];
  const subjectName = (name === '哲学') ? '思维与存在' : name;
  const interestName = (name === '哲学') ? '理论研究' : name;
  return {
    whatIs: name + '是' + catName + '门类下的专业，主要研究' + subjectName + '相关的基础理论、专业知识和实践技能。本专业培养具有扎实理论基础、较强实践能力和创新精神的高级专门人才，能够在相关领域从事教学、科研、管理等工作。通过系统学习，学生将掌握本专业的核心理论与方法，具备分析和解决实际问题的能力。专业注重理论与实践相结合，强调综合素质的培养，为学生未来的职业发展和深造奠定坚实基础。',
    whatLearn: '本专业学生主要学习' + catName + '学科的基本理论和基本知识，接受专业思维和方法的基本训练，掌握本专业的基本能力。主要学习内容包括：学科基础理论、专业核心课程、相关学科知识、实验/实践教学、科研训练、实习实训等环节。毕业生应获得以下几方面的知识和能力：1. 掌握学科的基本理论和基本知识；2. 掌握本专业的分析方法和技术；3. 具有较强的创新意识和独立从事实际工作的能力；4. 熟悉国家相关方针、政策和法规；5. 了解本学科的理论前沿和发展动态；6. 掌握文献检索、资料查询的基本方法，具有一定的科学研究和实际工作能力。'
  };
}

function generateEmployment(category) {
  const industries = pickRandom(INDUSTRIES_POOL, 5).map((name, i) => {
    const weights = [35, 25, 18, 12, 10];
    return { name, percent: weights[i] || random(5, 20) };
  });
  const totalPct = industries.reduce((s, i) => s + i.percent, 0);
  industries.forEach(it => { it.percent = Math.round(it.percent * 100 / totalPct); });

  const salaryCities = shuffle(CITIES).slice(0, 10).map(c => ({
    city: c.city,
    salary: c.base + random(-2000, 5000)
  }));
  const avgMonth = Math.round(salaryCities.reduce((s, c) => s + c.salary, 0) / 10);

  const majors = MAJOR_TEMPLATES[category].slice(0, 6).map(t => ({
    name: t.name + '方向',
    major: t.name
  }));

  const universities = pickRandom(UNIVERSITIES, 8).map(u => ({
    name: u.name,
    level: u.level,
    score: u.score + random(-30, 20),
    isStrongBase: u.isStrongBase
  }));

  return {
    industries,
    salary: { avgMonth5y: avgMonth, topCities: salaryCities },
    postgraduate: { directions: majors },
    universities
  };
}

function generateQAs(name) {
  const subjectName = (name === '哲学') ? '理论研究' : name;
  return [
    { q: name + '专业主要学习哪些内容？', a: name + '专业主要学习学科基础理论、专业核心课程以及实践环节。具体课程设置涵盖理论学习、实验实践、实习实训等多个方面，注重培养学生的综合能力。具体请参见核心课程部分。' },
    { q: name + '专业的就业前景如何？', a: name + '专业毕业生就业前景广阔，可在多个行业领域发展。随着社会发展，相关领域的人才需求持续增长，毕业生就业率保持较高水平。具体就业方向可参考就业方向部分。' },
    { q: name + '专业适合什么样的学生报考？', a: '适合对' + subjectName + '领域有浓厚兴趣，具备较好的逻辑思维能力、学习能力和沟通能力的学生报考。同时需要有耐心、细心，有责任感的学生会更适合本专业的学习。' },
    { q: name + '专业的考研方向有哪些？', a: '可报考本专业及相关专业的研究生。常见的考研方向包括本专业的各个细分领域，以及交叉学科方向。具体推荐可参考考研方向部分。建议根据个人兴趣和职业规划选择合适的方向。' },
    { q: name + '专业需要学习数学吗？', a: '根据专业特点，数学是重要的基础课程之一。大部分专业需要学习高等数学、线性代数、概率论等数学基础课程，为后续专业学习打下基础。具体要求以各校培养方案为准。' },
    { q: name + '专业的薪资水平如何？', a: '薪资水平因地区、行业、个人能力等因素差异较大。一般而言，毕业初期薪资在中等水平，随着工作经验的积累和能力提升，薪资会有较大幅度增长。具体数据可参考薪资行情部分。' }
  ];
}

function generateSelectSubjects(category) {
  const libCats = ['哲', '经', '法', '教', '文', '史', '艺'];
  if (libCats.includes(category)) {
    return {
      preferred: '物理或历史均可',
      firstChoice: { physics: random(30, 50), history: random(50, 70) },
      secondChoice: {
        '政治+地理': random(10, 25),
        '政治+生物': random(5, 15),
        '化学+生物': random(5, 15),
        '地理+政治': random(10, 20),
        '不限': random(30, 50)
      }
    };
  }
  return {
    preferred: '物理必选',
    firstChoice: { physics: random(85, 99), history: random(1, 15) },
    secondChoice: {
      '化学+生物': random(40, 60),
      '化学+地理': random(15, 25),
      '生物+地理': random(5, 15),
      '化学+政治': random(5, 15),
      '不限': random(5, 15)
    }
  };
}

function generateRelatedIds(allMajors, currentCat, currentId) {
  const sameCat = allMajors.filter(m => m.category === currentCat && m.id !== currentId);
  return pickRandom(sameCat, Math.min(6, sameCat.length)).map(m => m.id);
}

function generateAllData() {
  const majors = [];
  let id = 1;

  CATEGORIES.forEach(cat => {
    const templates = MAJOR_TEMPLATES[cat];
    templates.forEach(tpl => {
      const hotTag = HOT_TAGS[random(0, HOT_TAGS.length - 1)];
      const employmentRate = random(75, 97);
      const popularity = random(1, 100) > 70 ? random(4, 5) : random(2, 4);
      const salaryBase = (cat === '医') ? random(8000, 20000) :
                   (cat === '工') ? random(9000, 22000) :
                   (cat === '经') ? random(8500, 21000) :
                   (cat === '管') ? random(7500, 18000) :
                   (cat === '军') ? random(9000, 19000) :
                   (cat === '理') ? random(7000, 16000) :
                   (cat === '法') ? random(7000, 17000) :
                   (cat === '艺') ? random(8000, 18000) :
                   random(5500, 14000);
      const maleRatio = (cat === '军') ? random(75, 95) :
                        (cat === '工') ? random(65, 90) :
                        (cat === '理') ? random(55, 80) :
                        (cat === '医') ? random(35, 60) :
                        (cat === '农') ? random(45, 70) :
                        (cat === '经') ? random(40, 60) :
                        (cat === '管') ? random(35, 55) :
                        (cat === '法') ? random(35, 55) :
                        (cat === '教') ? random(25, 50) :
                        (cat === '哲') ? random(45, 65) :
                        (cat === '史') ? random(40, 60) :
                        (cat === '文') ? random(20, 45) : random(15, 40);
      const femaleRatio = 100 - maleRatio;
      const sciRatio = ['理', '工', '农', '医', '军'].includes(cat) ? random(70, 95) :
                        ['经', '管'].includes(cat) ? random(40, 60) : random(10, 35);
      const libRatio = 100 - sciRatio;
      const isFirstClass = random(1, 100) > 60;
      const isCharacteristic = (hotTag === '国家特色') || (random(1, 100) > 75);

      majors.push({
        id: id,
        name: tpl.name,
        code: tpl.code,
        category: cat,
        degree: tpl.degree,
        years: tpl.years,
        popularity: popularity,
        employmentRate: employmentRate,
        avgSalary5y: salaryBase,
        isFirstClass: isFirstClass,
        isCharacteristic: isCharacteristic,
        hotTag: hotTag,
        maleRatio: maleRatio,
        femaleRatio: femaleRatio,
        libRatio: libRatio,
        sciRatio: sciRatio,
        selectSubjects: generateSelectSubjects(cat),
        overview: generateOverview(tpl.name, cat),
        coreCourses: generateCourses(cat),
        employment: generateEmployment(cat),
        qas: generateQAs(tpl.name)
      });
      id++;
    });
  });

  majors.forEach(m => {
    m.relatedIds = generateRelatedIds(majors, m.category, m.id);
  });

  return {
    generatedAt: new Date().toISOString(),
    total: majors.length,
    categories: CATEGORIES,
    categoryNames: CATEGORY_NAMES,
    majors: majors
  };
}

function fetchRemoteData() {
  return new Promise((resolve) => {
    const url = 'https://example.com/api/majors';
    const timeout = setTimeout(() => {
      resolve(null);
    }, 5000);
    try {
      const req = https.get(url, { timeout: 5000 }, (res) => {
        clearTimeout(timeout);
        if (res.statusCode !== 200) {
          resolve(null);
          return;
        }
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve(json);
          } catch (e) {
            resolve(null);
          }
        });
      });
      req.on('error', () => { clearTimeout(timeout); resolve(null); });
      req.on('timeout', () => { req.destroy(); resolve(null); });
      req.end();
    } catch (e) {
      clearTimeout(timeout);
      resolve(null);
    }
  });
}

async function main() {
  console.log('开始获取专业数据...');
  console.log('尝试从远程获取数据...');

  let data = await fetchRemoteData();

  if (!data || !data.majors || data.majors.length < 50) {
    console.log('远程获取失败或数据不足，正在生成示例数据...');
    data = generateAllData();
    console.log('生成了 ' + data.majors.length + ' 条专业数据');
  } else {
    console.log('从远程获取了 ' + data.majors.length + ' 条专业数据');
  }

  const dir = path.dirname(DATA_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
  console.log('数据已保存到: ' + DATA_PATH);
  console.log('统计信息:');
  console.log('   专业总数: ' + data.majors.length);
  const catCounts = {};
  data.majors.forEach(m => {
    catCounts[m.category] = (catCounts[m.category] || 0) + 1;
  });
  Object.entries(catCounts).forEach(([cat, count]) => {
    console.log('   ' + CATEGORY_NAMES[cat] + ': ' + count + ' 个');
  });
}

main().catch(err => {
  console.error('错误:', err);
  console.log('正在使用内置数据生成器...');
  const data = generateAllData();
  const dir = path.dirname(DATA_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
  console.log('已生成 ' + data.majors.length + ' 条数据并保存');
  process.exit(0);
});
