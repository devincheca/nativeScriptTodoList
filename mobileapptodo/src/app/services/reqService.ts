import { request, getFile, getImage, getJSON, getString } from "tns-core-modules/http";
import location from '../prototypes/location';
const address = new location();
const url = address.getLocation();
export default class reqService
{
  async req(endpoint, input)
  {
    return fetch(url + endpoint,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: input })
    })
    .then((res) => { return res.json(); })
    .then((res) => { return res; })
    .catch((error) => { console.trace(error); });
  }
}