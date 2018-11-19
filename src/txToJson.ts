import { schemaByTransactionType } from './schemas'
import { Tx } from './transactions'

const isLongType = (type:any) => {
  if (typeof type !== 'object') return false
  return type[0]==='string' && type[1]==='number'
}

// const resolvePath = (obj:any, path: string[]): any => {
//   if (path.length === 0) {
//     return obj
//   }else if(obj[path[0]] === undefined){
//     return undefined
//   }else if (obj[path[0]]===){
//
//   }
// }


export function txToJson(value: Tx): string | undefined {
  const path: string[] = []
  const stack: any[] = []
  const type: number = value.type

  function stringifyValue(value: any): string | undefined {

    if (typeof value === 'string' && path.length == 1) {
      const prop = schemaByTransactionType[type].properties[path[0]]
      if (prop && isLongType(prop.type)) {
        return value
      }
    }

    if (typeof value === 'boolean' || value instanceof Boolean ||
      value === null ||
      typeof value === 'number' || value instanceof Number ||
      typeof value === 'string' || value instanceof String ||
      value instanceof Date) {
      return JSON.stringify(value)
    }

    if (Array.isArray(value)) {
      return stringifyArray(value)
    }

    if (value && typeof value === 'object') {
      return stringifyObject(value)
    }

    return undefined
  }

  function stringifyArray(array: any[]): string {
    let str = '['

    const stackIndex = stack.length
    stack[stackIndex] = array

    for (let i = 0; i < array.length; i++) {
      let key = i + ''
      let item = array[i]

      if (typeof item !== 'undefined' && typeof item !== 'function') {
        path[stackIndex] = key
        str += stringifyValue(item)
      }
      else {
        str += 'null'
      }

      if (i < array.length - 1) {
        str += ','
      }
    }

    stack.length = stackIndex
    path.length = stackIndex

    str += ']'
    return str
  }

  function stringifyObject(object: any): string {
    let first = true
    let str = '{'

    const stackIndex = stack.length
    stack[stackIndex] = object

    for (let key in object) {
      if (object.hasOwnProperty(key)) {
        let value = object[key]

        if (includeProperty(value)) {
          if (first) {
            first = false
          }
          else {
            str += ','
          }

          str += ('"' + key + '":')

          path[stackIndex] = key
          str += stringifyValue(value)
        }
      }
    }

    stack.length = stackIndex
    path.length = stackIndex

    str += '}'
    return str
  }

  function includeProperty(value: any) {
    return typeof value !== 'undefined'
      && typeof value !== 'function'
  }

  return stringifyValue(value)
}
