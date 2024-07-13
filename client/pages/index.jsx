import { InterviewPrep } from "../components/InterviewPrep";

export function getMeta() {
  return {
    title: "Interview prep buddy",
  };
}

export default function Index() {
  const message = "Welcome to @fastify/react!";
  return (
    <>
      <InterviewPrep />
    </>
  );
}
