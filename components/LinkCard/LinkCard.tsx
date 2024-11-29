import Link from "next/link";
import type { ReactNode } from "react";

interface LinkCardProps {
	title: string;
	link: string;
	description?: string;
	icon?: ReactNode;
}

// TODO: Handle light mode better
const LinkCard = ({ title, description, link, icon }: LinkCardProps) => {
	return (
		<Link
			className="bg-gradient-to-b from-primary to-primary/70 rounded-lg p-4"
			href={link}
		>
			{icon && <div className="text-white mb-2">{icon}</div>}
			<div>
				<h3 className="text-lg font-bold text-white">{title}</h3>
				{description && (
					<p className="text-sm text-white/80 mt-2">{description}</p>
				)}
			</div>
		</Link>
	);
};

export default LinkCard;
