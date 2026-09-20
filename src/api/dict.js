// src/api/dict.js  （小程序端）
import request from '@/utils/request'

/**
 * 拉取某类型字典的平铺列表
 * @param {string} dictType 字典类型，如 'analysis_platform'、'exam_type'
 * @param {number} [level] 可选，过滤层级
 */
export function listDict(dictType, level) {
  const params = { dictType }
  // ★ 只有 level 有值才带上，避免拼成 "undefined"
  if (level !== undefined && level !== null && level !== '') {
    params.level = level
  }
  return request({
    url: '/api/dict/list',
    method: 'GET',
    data: params
  })
}

/**
 * 拉取某类型字典的树形结构
 */
export function treeDict(dictType) {
  return request({
    url: '/api/dict/tree',
    method: 'GET',
    data: { dictType }
  })
}