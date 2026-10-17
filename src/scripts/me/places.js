// Where every room sits in the house, in room-size units from the home room, what it is called and
// the one-line hint the room bar shows there. Shared by the camera (scene.js), the loose pages that
// can fly into other rooms (rooms/papers.js) and the room bar.
import {t} from './language.js';

export const places = {
  home: {x: 0, y: 0, z: 1, name: t("小屋中央", "At home")},
  papers: {x: -1.12, y: .01, z: 1, name: t("几张散页", "Loose pages"), hint: t("举到光里看看 · 点一下翻面", "Hold a page to the light · Click to turn")},
  music: {x: 1.13, y: 0, z: 1, name: t("琴弦之间", "A little jam"), hint: t("划过琴弦 · A S D F G H", "Pluck a string · A S D F G H")},
  trace: {x: .06, y: -1.11, z: 1, name: t("留一笔", "Leave a line"), hint: t("画一根弦 · 松手再拨动", "Draw a line · Let go, then pluck")},
  rethink: {x: -1.12, y: 1.12, z: 1, name: t("另一面", "The other side"), hint: t("拖动纸带 · 换一面想想", "Turn the ribbon · Think again")},
  work: {x: 1.13, y: 1.12, z: 1, name: t("拆开看看", "Beneath the surface"), hint: t("移动切面 · 看见做法与边界", "Move the section · Reveal decisions")},
  idle: {x: 0, y: 1.12, z: 1, name: t("不赶时间", "No hurry"), hint: t("把「应该」放下 · 或者，别动", "Let go of a “should” · Or stay still")},
  paths: {x: -1.12, y: -1.11, z: 1, name: t("未走之路", "Paths untaken"), hint: t("拨开线束 · 听一条自己的路", "Bend the threads · Hear your path")},
  blindspot: {x: 1.13, y: -1.11, z: 1, name: t("盲点", "Blind spots"), hint: t("转动「确定」 · 看见藏住的间隙", "Turn certainty · Find its gaps")},
  overview: {x: .01, y: .035, z: .24, name: t("整间小屋", "The whole room")},
};
export const rooms = Object.keys(places).filter(place => place !== 'overview');
// Rooms without their own hint (home, overview) explain how to move around.
export const wanderHint = narrow => narrow ? t("拖动画面 · 双指缩放", "Drag to wander · Pinch to zoom") : t("拖动画面漫游 · 滚轮缩放", "Drag to wander · Scroll to zoom");
