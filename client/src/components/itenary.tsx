import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { marked } from "marked";
import { useEffect,useState } from "react";
export default function Itenary({ itenaryData }: { itenaryData: any }) {
  const [markdown, setMarkdown] = useState<any>();
  
  const convertToMarkdown = (data: any) => {
    const markdown = marked(data);
    setMarkdown(markdown);
  }

  useEffect(() => {
    convertToMarkdown(itenaryData);
  }, [itenaryData]);
  return (
    <div className="flex flex-col items-center w-full min-h-screen p-4">
      <main className="w-full max-w-2xl p-4 bg-white rounded-lg shadow-md">
        <h1 className="mb-4 text-3xl font-bold">Your Recommended Itinerary</h1>
        <Accordion type="single" collapsible>
          {itenaryData === null ? (
            <p className="text-lg text-center">No itinerary available</p>
          ) : (
            <AccordionItem value="day-1">
              <AccordionTrigger>
                <h2>Open Up</h2>
              </AccordionTrigger>
              <AccordionContent>
                <div id="markdown" dangerouslySetInnerHTML={{__html:markdown}}></div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </main>
    </div>
  );
}
