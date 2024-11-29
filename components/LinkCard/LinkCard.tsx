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
		<a
			className="bg-gradient-to-b from-primary to-primary/70 rounded-lg p-4"
			href={link}
		>
			{icon && <div className="w-10 h-10 mb-2">{icon}</div>}
			<div>
				<h3 className="text-lg font-bold text-white">{title}</h3>
				{description && (
					<p className="text-sm text-white/70 mt-2">{description}</p>
				)}
			</div>
		</a>
	);
};

export default LinkCard;
