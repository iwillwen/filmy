import config from './i18n.config.json'

export default i18n(config)

export function i18n(config) {
  const lang = navigator.language
  const defaultLang = config._default
  
  return function(key, language = lang) {
    key = key.toLowerCase()
    
    // 检索适配标签
    const translations = config[key]
    
    // 如果适配配置中不存在
    // 则直接将输入的键值返回
    if (!translations) return key
    
    // 如果配置文件中存在对详细语言进行适配，则将适配内容返回
    if (translations[language]) return translations[language]
    
    // 配置文件中存在对语言的笼统分类进行适配
    language = language.split('-')[0]
    if (translations[language]) return translations[language]
    
    // 返回默认配置结果
    if (translations[defaultLang]) return translations[defaultLang]
    
    return key
  }
}

export function detectLang() {
  const lang = navigator.language

  return lang.split('-')[0]
}