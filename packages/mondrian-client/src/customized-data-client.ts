import { IMondrianData, MondrianDataClient } from "@mondrian/mondrian";

export class CustomizedDataClient extends MondrianDataClient {
  constructor() {
    super();
    // do something like create websocket client instance
    console.log("my data client init");
  }

  override start() {
    // do something like start websocket client
    console.log("my data client start");

    // mock send data to let data manager knows the last one of the first batch of data recovered, and it is ready to tell that recover process is finished, so mondrian can do things likes removing loading modal.
    this.receivedFromRemote([this.generateLastData()]);
    this.recoveredFromRemote({ success: true, size: 0 });

    // mock received data synchronously
    setInterval(() => {
      // tell data manager to handle new arrived data
      console.log("new data arrivied");
      this.receivedFromRemote([
        // data from remote
      ]);
    }, 3000);
  }

  override sendToRemote(datasToSend: IMondrianData[]) {
    // do something like emit data or do request
    datasToSend.forEach((data) => {
      console.log("data to send", data);
    });
  }
}
