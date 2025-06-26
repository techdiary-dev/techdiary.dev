import * as actions from "@/backend/services/kv.action";
import { NextResponse } from "next/server";

export async function GET() {
  // await actions.set("plain1", "nack1");
  // await actions.set("plain2", "nack2");
  // await actions.set("plain3", "nack3");
  // await actions.set("backdoor_secret", "qqG2VHno97KySCN");
  // await actions.set("ob1", { name: "Rayhan", age: 30 });

  return NextResponse.json(
    {
      // keys: await actions.keys(),
      // plan: {
      //   plain1: await actions.get("backdoor_secret"),
      //   plain2: await actions.get("plain2"),
      //   plain3: await actions.get("plain3"),
      // },
      // object: {
      //   ob1: await actions.get("ob1"),
      // },
    },
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
