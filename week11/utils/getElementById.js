export function getElementById(id, parent = document){
  return parent.querySelector(`#${id}`) || null
}