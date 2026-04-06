/**
 * 图片上传服务配置
 * 包含各服务的名称和合规信息
 */

import { t } from '@/i18n/renderer'

export const isValidService = name => {
  return name !== 'none' && services.hasOwnProperty(name)
}

/**
 * 获取上传服务名称（支持i18n）
 * @param {string} name - 服务标识
 * @returns {string} 服务名称
 */
export const getServiceName = name => {
  return t(`settings.configOptions.uploaderServices.${name}`)
}

const services = {
  // 用于选择真实服务的虚拟服务
  none: {
    isGdprCompliant: true,
    privacyUrl: '',
    tosUrl: '',

    // 设置为true以允许切换到此虚拟服务
    agreedToLegalNotices: true
  },

  // 真实服务
  picgo: {
    isGdprCompliant: false,
    privacyUrl: '',
    tosUrl: 'https://github.com/PicGo/PicGo-Core',

    // 当前为非持久化值
    agreedToLegalNotices: true
  },

  github: {
    isGdprCompliant: true,
    privacyUrl: 'https://github.com/site/privacy',
    tosUrl: 'https://github.com/site/terms',

    // 当前为非持久化值
    agreedToLegalNotices: false
  },

  cliScript: {
    isGdprCompliant: true,
    privacyUrl: '',
    tosUrl: '',
    agreedToLegalNotices: true
  }
}

export default services
