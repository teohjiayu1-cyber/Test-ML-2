
import { Question } from './types';

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Masyarakat masih kurang peduli terhadap peranan mereka untuk mencegah penderaan kanak-kanak. Huraikan.",
    maxMarks: 6,
    schema: {
      IU1: "Ramai yang beranggapan bahawa penderaan kanak-kanak berpunca daripada sikap ibu bapa yang tidak bertanggungjawab. (2m)",
      IS1: "sedangkan anak-anak merupakan anugerah dan amanah yang perlu dijaga dengan baik. (1m)",
      IU2: "Masyarakat juga menuding pemerintah sebagai pihak yang tidak proaktif dalam memastikan kanak-kanak selamat dan terbela nasibnya. (2m)",
      IS2: "Pihak berkuasa turut digesa supaya menggerakkan langkah-langkah yang berkesan bagi menangani masalah penderaan kanak-kanak. (1m)"
    }
  },
  {
    id: 2,
    text: "Cara kehidupan masyarakat zaman ini mendedahkan kanak-kanak pada persekitaran yang kurang selamat. Jelaskan sebab-sebabnya.",
    maxMarks: 6,
    schema: {
      IU1: "Suasana perumahan zaman ini tidak mesra seperti dahulu yang mana kanak-kanak bebas bermain dengan aman dan terlindung di rumah jiran kerana pintu-pintu rumah sentiasa terbuka luas. (2m)",
      IS1: "Hubungan antara jiran tetangga yang tidak mesra dan tiadanya rasa kekeluargaan menjadikan jiran-jiran tidak peka dengan kemaslahatan semua dan tidak menjaga anak-anak jiran seperti anak mereka sendiri. (1m)",
      IU2: "Masyarakat hari ini hanya memberikan tumpuan pada kehidupan sendiri dan tidak mahu mengambil tahu hal orang lain. (2m)",
      IS2: "Disebabkan itu, mereka tidak mengambil inisiatif untuk mencari maklumat lanjut dan bertindak biarpun wujud kecurigaan yang melibatkan keselamatan seseorang. (1m)"
    }
  },
  {
    id: 3,
    text: "Bagaimanakah penderaan terhadap kanak-kanak menjejaskan hubungan mereka dengan orang lain?",
    maxMarks: 6,
    schema: {
      IU1: "Kanak-kanak yang melalui penderaan berasa sukar membina kepercayaan diri, bergaul dan berinteraksi. (2m)",
      IS1: "Hal ini adalah kerana, apabila seseorang itu melalui kejadian traumatik seperti penderaan, seluruh tubuh mereka akan mengingati kejadian tersebut dan ingatan ini mengakibatkan kegelisahan. (1m)",
      IU2: "Mereka juga berasa tidak selesa untuk berkongsi dengan sesiapa pun tentang apa yang berlaku sehingga menimbulkan ketegangan hubungan dengan pihak yang menginginkan kejelasan tentang hal yang berlaku. (2m)",
      IS2: "Hal ini adalah kerana, apabila tubuh mereka mengingati kesan kejadian penderaan, mereka sukar mengawal perasaan. (1m)"
    }
  },
  {
    id: 4,
    text: "Proses pemulihan trauma memerlukan usaha keluarga dan masyarakat. Huraikan.",
    maxMarks: 6,
    schema: {
      IU1: "Masyarakat harus bersabar dan memberikan masa yang panjang kepada kanak-kanak mangsa penderaan untuk pulih. (2m)",
      IS1: "Kita juga tidak harus meremehkan apa yang dikongsi oleh kanak-kanak ini kerana ia merupakan pengalaman pahit yang tidak mungkin dapat dilupakan. (1m)",
      IU2: "Ahli keluarga boleh membantu membina keyakinan diri mangsa kanak-kanak dengan menitipkan kata-kata pembakar semangat. (2m)",
      IS2: "Seandainya terlihat perubahan yang ketara dari segi perubahan fizikal, emosi atau mental, keluarga harus mengambil berat dan bertanyakan khabar agar campur tangan awal dapat digerakkan. (1m)"
    }
  }
];

export const SYSTEM_INSTRUCTION = `
You are an expert Malay language teacher and grader for H2MLL exams. 
Your task is to grade student answers based on the provided marking scheme (Skema Jawapan).

MARKING RULES:
1. Total marks per question: 6m.
2. Structure: There are two main points per question. Each point has an IU (2m) and an IS (1m).
3. Cluster 1: IU1 (2m) + IS1 (1m) = 3m.
4. Cluster 2: IU2 (2m) + IS2 (1m) = 3m.
5. Critical Rule: Both IU and IS MUST be present in a cluster to award marks for that cluster. If either part is missing, award 0 marks for that specific cluster.
6. Grammar Rule: If there are ANY grammatical or spelling errors in the entire response, deduct 1m from the total score for that question.
7. Output Format: You must provide a JSON response.

RESPONSE SCHEMA:
{
  "score": number (0-6),
  "feedback": "string explaining why points were awarded/deducted",
  "breakdown": {
    "IU1": boolean (true if present),
    "IS1": boolean (true if present),
    "IU2": boolean (true if present),
    "IS2": boolean (true if present),
    "hasGrammarError": boolean (true if errors found)
  }
}
`;
