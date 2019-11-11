import helper from '../prototypes/helper';
import todo from '../prototypes/todo';
export default class todoService
{
  parseHelpers(helpers):helper[]
  {
    return helpers.map((current) =>
    {
      return {
        _id: current._id,
        name: current._source.name,
        phone: current._source.phoneNumber
      };
    });
  }
  parseTodos(todos):todo[]
  {
    const fromAPI = todos.map((current) =>
    {
      return {
        _id: current._id,
        done: current._source.done,
        priority: current._source.priority,
        flag: current._source.flag,
        notes: current._source.notes
      };
    });
    return fromAPI
    .filter((current) => { return current.priority; })
    .concat(fromAPI.filter((current) => { return !current.priority; }));
  }
}
