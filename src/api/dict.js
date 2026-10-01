// src/api/dict.js （小程序端）
import request from '@/utils/request'

/**
 * 拉取某类型字典的平铺列表
 */
export function listDict(dictType, level) {
  const params = { dictType }
  if (level !== undefined && level !== null && level !== '') {
    params.level = level
  }
  return request({
    url: '/api/dict/list',
    method: 'GET',
    params                             // ★ data → params
  })
}

/**
 * 拉取某类型字典的树形结构
 */
export function treeDict(dictType) {
  return request({
    url: '/api/dict/tree',
    method: 'GET',
    params: { dictType }               // ★ data → params
  })
}