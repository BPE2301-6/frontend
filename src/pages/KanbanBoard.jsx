function TaskCard({
  title,
  description,
  date,
  type,
  priority,
  assignee: _assignee,
  className = '',
}) {
  const getPriorityColor = () => {
    switch (priority) {
      case 'high':
        return 'bg-figma-red';
      case 'medium':
        return 'bg-figma-yellow';
      case 'low':
        return 'bg-figma-green';
      default:
        return 'bg-figma-red';
    }
  };

  return (
    <div
      className={`w-figma-card-width h-figma-card-height bg-figma-card rounded-figma-card relative ${className}`}
    >
      <div
        className={`absolute w-[17px] h-[17px] rounded-full ${getPriorityColor()} top-[18px] right-[24px]`}
      ></div>

      <div className="absolute top-[15px] left-[24px]">
        <div className="text-figma-card-title font-montserrat font-medium text-figma-white leading-[20px]">
          {title}
        </div>
      </div>

      <div className="absolute top-[49px] left-[24px]">
        <div className="text-figma-card-text font-montserrat font-medium text-figma-text-secondary leading-[17px]">
          {description}
        </div>
      </div>

      {date && (
        <div className="absolute top-[91px] left-[24px]">
          <div className="text-figma-card-text font-montserrat font-medium text-figma-text-secondary leading-[17px]">
            {date}
          </div>
        </div>
      )}

      <div className="absolute bottom-[17px] left-[24px]">
        <div className="text-figma-card-text font-montserrat font-medium text-figma-text-secondary leading-[17px]">
          {type}
        </div>
      </div>

      <div className="absolute bottom-[17px] right-[24px]">
        <div className="w-9 h-9 bg-figma-white rounded-full flex items-center justify-center">
          <div className="w-6 h-6 border-4 border-figma-user-border rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({ title, tasks, className = '' }) {
  return (
    <div
      className={`w-figma-column-width h-figma-column-height border border-figma-blue border-t-0 rounded-t-figma-column relative ${className}`}
    >
      <div className="absolute -top-[47px] left-1/2 transform -translate-x-1/2">
        <div className="text-figma-title font-montserrat font-normal text-figma-white leading-[29px]">
          {title}
        </div>
      </div>

      <div className="pt-6 px-6 space-y-4">
        {tasks.map((task, index) => (
          <TaskCard key={index} {...task} />
        ))}
      </div>
    </div>
  );
}

function KanbanBoard() {
  const tasks = {
    todo: [
      {
        title: 'Название',
        description: 'Описание таски',
        date: '16.10.25',
        type: 'тип #номер',
        priority: 'high',
        assignee: 'A',
      },
      {
        title: 'Задача 2',
        description: 'Описание второй задачи',
        date: '17.10.25',
        type: 'bug #123',
        priority: 'medium',
        assignee: 'B',
      },
      {
        title: 'Задача 3',
        description: 'Описание третьей задачи',
        date: '18.10.25',
        type: 'feature #456',
        priority: 'low',
        assignee: 'C',
      },
    ],
    inProgress: [
      {
        title: 'В работе',
        description: 'Задача в процессе выполнения',
        date: '15.10.25',
        type: 'task #789',
        priority: 'high',
        assignee: 'D',
      },
    ],
    review: [],
    done: [],
  };

  return (
    <div className="w-[1831px] h-[1024px] bg-figma-bg relative">
      <div className="absolute w-full h-figma-header top-0 left-0 bg-figma-bg border-b border-figma-blue">
        <div className="absolute left-[13px] top-[54px] text-figma-arrow font-montserrat font-bold text-figma-blue leading-[39px]">
          &gt;
        </div>

        <div className="absolute w-[1px] h-[148px] left-[44px] top-0 bg-figma-blue transform rotate-90 origin-top"></div>

        <div className="absolute left-[89px] top-[26px] text-figma-title font-montserrat font-bold text-figma-white leading-[29px]">
          НАЗВАНИЕ ДОСКИ
        </div>

        <div className="absolute w-[640px] h-[54px] left-[78px] top-[67px] border border-figma-blue rounded-figma-search">
          <div className="absolute left-[39px] top-[12px] text-figma-title font-montserrat font-medium text-figma-white leading-[29px]">
            найти таску
          </div>
        </div>

        <div className="absolute w-[54px] h-[54px] left-[740px] top-[67px] bg-figma-orange rounded-full flex items-center justify-center">
          <div className="text-figma-plus font-montserrat font-bold text-figma-white leading-[55px]">
            +
          </div>
        </div>

        <div className="absolute left-[360px] top-[19px] flex space-x-[8px]">
          {['A', 'B', 'C'].map((user, index) => (
            <div
              key={index}
              className="w-9 h-9 bg-figma-white rounded-full flex items-center justify-center"
            >
              <div className="w-6 h-6 border-4 border-figma-user-border rounded-full"></div>
            </div>
          ))}
        </div>
      </div>

      {/* <div className="absolute left-[90px] top-[167px] text-figma-title font-montserrat font-medium text-figma-white leading-[29px]">
        возможно тут будет деление на доски
      </div> */}

      <div className="absolute w-full h-[1px] left-0 top-[196px] bg-figma-blue"></div>

      <div className="absolute left-[55px] top-[285px] flex space-x-[70px]">
        <KanbanColumn title="Сделать" tasks={tasks.todo} />
        <KanbanColumn title="В работе" tasks={tasks.inProgress} />
        <KanbanColumn title="На проверке" tasks={tasks.review} />
        <KanbanColumn title="Готово" tasks={tasks.done} />
      </div>
    </div>
  );
}

export default KanbanBoard;
