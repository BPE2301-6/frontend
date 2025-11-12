// import React, { useState } from 'react';

// export default function Board() {
//   const [columns] = useState({
//     todo: [
//       { 
//         id: '1', 
//         title: 'Название', 
//         description: 'Описание тесни', 
//         points: 0.25, 
//         type: 'тип Янокера' 
//       },
//       { 
//         id: '2', 
//         title: 'Название', 
//         description: 'Описание тесни', 
//         points: 0.25, 
//         type: 'тип Янокера' 
//       },
//     ],
//     inProgress: [
//       { 
//         id: '3', 
//         title: 'Название', 
//         description: 'Описание тесни', 
//         points: 0.25, 
//         type: 'тип Янокера' 
//       },
//     ],
//     review: [],
//     done: [],
//   });

//   const columnTitles = {
//     todo: 'Сделать',
//     inProgress: 'В работе',
//     review: 'На проверке',
//     done: 'Готово'
//   };

//   return (
//     <div style={{ 
//       backgroundColor: '#242528', 
//       minHeight: '100vh', 
//       fontFamily: 'Montserrat, sans-serif',
//       color: '#FFFFFF'
//     }}>
//       {/* Навигационное меню */}
//       <div style={{
//         position: 'absolute',
//         width: '100%',
//         height: '148px',
//         top: 0,
//         left: 0,
//         background: '#242528',
//         borderBottom: '1px solid #1E80D9',
//         display: 'flex',
//         alignItems: 'center',
//         padding: '0 50px',
//         boxSizing: 'border-box',
//         zIndex: 10,
//       }}>
//         {/* Название доски */}
//         <div style={{
//           fontWeight: 700,
//           fontSize: '24px',
//           color: '#FFFFFF',
//         }}>
//           НАЗВАНИЕ ДОСКИ
//         </div>

//         {/* Поиск */}
//         <div style={{
//           marginLeft: '50px',
//           position: 'relative',
//           width: '640px',
//           height: '54px',
//           border: '1px solid #1E80D9',
//           borderRadius: '32px',
//           display: 'flex',
//           alignItems: 'center',
//           padding: '0 16px',
//           color: '#838486',
//           fontSize: '16px',
//           fontWeight: 400,
//         }}>
//           найти таску
//         </div>

//         {/* Боковая панель с навигацией */}
//         <div style={{ 
//           marginLeft: 'auto', 
//           display: 'flex', 
//           alignItems: 'center',
//           gap: '32px'
//         }}>
//           {/* Навигационные ссылки */}
//           <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
//             <div style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 600 }}>мои проекты</div>
//             <div style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 600 }}>команды</div>
//             <div style={{ color: '#FFFFFF', fontSize: '16px', fontWeight: 600 }}>профиль</div>
//           </div>

//           {/* Разделитель */}
//           <div style={{ height: '40px', width: '1px', backgroundColor: '#1E80D9' }}></div>

//           {/* Кнопки пользователей */}
//           <div style={{ display: 'flex', gap: '8px' }}>
//             {[1,2,3].map((i) => (
//               <div key={i} style={{
//                 width: '44px',
//                 height: '44px',
//                 borderRadius: '50%',
//                 background: '#757575',
//                 border: '2px solid #FFFFFF',
//               }}></div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Заголовок раздела */}
//       <div style={{
//         padding: '180px 50px 20px',
//         color: '#838486',
//         fontSize: '16px',
//         fontWeight: 400,
//       }}>
//         возможно тут будет деление на доски
//       </div>

//       {/* Основная область с колонками */}
//       <div style={{
//         display: 'flex',
//         padding: '0 50px 20px',
//         gap: '16px',
//         overflowX: 'auto'
//       }}>
//         {Object.entries(columns).map(([colKey, tasks]) => (
//           <div key={colKey} style={{
//             width: '372px',
//             minHeight: '500px',
//             flexShrink: 0,
//             border: '1px solid #1E80D9',
//             borderRadius: '50px 50px 0 0',
//             backgroundColor: '#313236',
//             overflow: 'hidden',
//           }}>
//             {/* Заголовок колонки */}
//             <div style={{
//               padding: '16px 24px',
//               borderBottom: '1px solid #1E80D9',
//               fontSize: '20px',
//               fontWeight: 700,
//               textAlign: 'center',
//             }}>
//               {columnTitles[colKey]}
//             </div>
            
//             {/* Задачи в колонке */}
//             <div style={{ padding: '16px' }}>
//               {tasks.map(task => (
//                 <div key={task.id} style={{
//                   backgroundColor: '#242528',
//                   borderRadius: '32px',
//                   padding: '16px 24px',
//                   marginBottom: '16px',
//                   border: '1px solid #1E80D9',
//                 }}>
//                   <div style={{
//                     fontSize: '20px',
//                     fontWeight: 700,
//                     marginBottom: '8px'
//                   }}>
//                     {task.title}
//                   </div>
//                   <div style={{ 
//                     color: '#838486', 
//                     fontSize: '16px',
//                     marginBottom: '8px'
//                   }}>
//                     {task.description}
//                   </div>
//                   <div style={{
//                     display: 'flex',
//                     justifyContent: 'space-between',
//                     alignItems: 'center',
//                     fontSize: '16px',
//                   }}>
//                     <span>№ {task.points}</span>
//                     <span>{task.type}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }