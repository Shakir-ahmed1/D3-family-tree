import { FamilyNode, FamilyTreeMembers } from "./node.interface";
import { userService } from "./services/user.service";


export function otherNodeDetails(familyNode: FamilyNode) {
    const wrapper = document.createElement('div');

    // Create the title and toggle button container
    const titleWrapper = document.createElement('div');
    titleWrapper.style.display = 'flex';
    titleWrapper.style.alignItems = 'center';
    titleWrapper.style.cursor = 'pointer';
    titleWrapper.style.width = '100%';

    const title = document.createElement('p');
    title.textContent = 'Other details';
    title.style.fontSize = '20px';
    title.style.margin = '0';
    title.style.flexShrink = '0';

    const line = document.createElement('hr');
    line.style.flexGrow = '1';
    line.style.marginLeft = '10px';

    titleWrapper.appendChild(title);
    titleWrapper.appendChild(line);
    wrapper.appendChild(titleWrapper);

    // Content container (initially hidden)
    const contentWrapper = document.createElement('div');
    contentWrapper.style.display = 'none';
    contentWrapper.style.marginLeft = '30px';

    function memberFormer(title: string, member: any) {
        const membersContainer = document.createElement('div');
        membersContainer.style.border = 'gray 1px solid';
        membersContainer.style.display = 'flex';
        membersContainer.style.alignItems = 'center';
        membersContainer.style.paddingLeft = '10px';

        const creatorsTitle = document.createElement('p');
        creatorsTitle.textContent = title + ':';
        creatorsTitle.style.marginRight = '20px';

        membersContainer.appendChild(creatorsTitle);

        const memberElement = createUserProfileElement(member);
        membersContainer.appendChild(memberElement);

        return membersContainer;
    }

    function formatDate(dateString: string) {
        const date = new Date(dateString);
        return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    }

    function createInfoRow(label: string, value: string) {
        const infoRow = document.createElement('div');
        infoRow.style.display = 'flex';
        infoRow.style.alignItems = 'center';

        const labelElement = document.createElement('p');
        labelElement.textContent = `${label}:`;
        labelElement.style.marginRight = '10px';
        labelElement.style.fontWeight = 'bold';

        const valueElement = document.createElement('p');
        valueElement.textContent = value;

        infoRow.appendChild(labelElement);
        infoRow.appendChild(valueElement);

        return infoRow;
    }

    if (familyNode.ownedBy) {
        contentWrapper.appendChild(memberFormer('Owned by', familyNode.ownedBy));
    }
    if (familyNode.createdBy) {
        contentWrapper.appendChild(memberFormer('Created by', familyNode.createdBy));
    }
    if (familyNode.suggestedBy) {
        contentWrapper.appendChild(memberFormer('Suggested by', familyNode.suggestedBy));
    }

    if (familyNode.createdAt) {
        contentWrapper.appendChild(createInfoRow('Created at', formatDate(familyNode.createdAt)));
    }
    if (familyNode.updatedAt) {
        contentWrapper.appendChild(createInfoRow('Updated at', formatDate(familyNode.updatedAt)));
    }

    wrapper.appendChild(contentWrapper);

    // Toggle functionality
    titleWrapper.addEventListener('click', (e) => {
        e.preventDefault();
        contentWrapper.style.display = contentWrapper.style.display === 'none' ? 'block' : 'none';
    });

    return wrapper;
}// Function to generate a temporary profile picture
export function generateTemporaryProfilePicture(userName) {
    const firstLetter = userName.charAt(0).toUpperCase();
    const colorIndex = userName.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % 8;
    const bgColor1 = backgroundColors[colorIndex];
    const bgColor2 = backgroundColors[(colorIndex + 3) % 8]; // Second color for gradient

    const canvas = document.createElement("canvas");
    canvas.width = 80;
    canvas.height = 80;
    const ctx = canvas.getContext("2d");

    if (ctx) {
        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, bgColor1);
        gradient.addColorStop(1, bgColor2);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add text
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "60px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(firstLetter, canvas.width / 2, canvas.height / 2);
    }

    return canvas.toDataURL();
}
export function createUserProfileElement(familyTreeMember) {
    if (!familyTreeMember || !familyTreeMember.user) {
        console.error("Invalid familyTreeMember object");
        return null;
    }

    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.gap = "10px";
    container.style.padding = '10px 2px';

    // Create name element
    const nameElement = document.createElement("span");
    nameElement.textContent = familyTreeMember.user.name;
    nameElement.style.fontSize = "16px";
    nameElement.style.fontWeight = "bold";

    // Create profile picture element
    const profilePic = document.createElement("img");
    profilePic.alt = `${familyTreeMember.user.name}'s profile picture`;
    profilePic.style.width = "40px"; // 5x relative size
    profilePic.style.height = "40px";
    profilePic.style.borderRadius = "50%";
    profilePic.style.objectFit = "cover";
    // profilePic.src = generateTemporaryProfilePicture(familyTreeMember.user.name);
    // Fetch profile picture from UserService
    userService.getUserProfilePicture(familyTreeMember.user.id)
        .then(response => {
            if (!response.ok) {
                throw new Error("No profile picture available");
            }
            return response.blob();
        })
        .then(blob => {
            profilePic.src = URL.createObjectURL(blob);
        })
        .catch(() => {
            // Generate temporary profile picture if the user has no profile picture
            profilePic.src = generateTemporaryProfilePicture(familyTreeMember.user.name);
        });

    // Append elements in order
    container.appendChild(profilePic);
    container.appendChild(nameElement);

    return container;
}
// Colors for background selection



export const backgroundColors = ["#1E1E1E", "#2C3E50", "#34495E", "#8E44AD", "#C0392B", "#16A085", "#D35400", "#2980B9"];
export function contributorDetailElement(title: string, contributors: FamilyTreeMembers[]) {
    const wrapper = document.createElement('div');
    const creatorsTitle = document.createElement('p');
    creatorsTitle.textContent = title;
    wrapper.appendChild(creatorsTitle);
    contributors.map(item => {
        const creator = createUserProfileElement(item);
        wrapper.appendChild(creator);
    });
    return wrapper;

}
export function contributorsElementGenerator(contributors) {
    const contributionWrapper = document.createElement('div');

    // Create the title and toggle button container
    const titleWrapper = document.createElement('div');
    titleWrapper.style.display = 'flex';
    titleWrapper.style.alignItems = 'center';
    titleWrapper.style.cursor = 'pointer';
    titleWrapper.style.width = '100%';

    const title = document.createElement('p');
    title.textContent = 'Allowed contributors';
    title.style.fontSize = '20px';
    title.style.margin = '0';
    title.style.flexShrink = '0'; // Ensures the text stays on the left


    const line = document.createElement('hr');
    line.style.flexGrow = '1';
    line.style.marginLeft = '10px';

    titleWrapper.appendChild(title);
    titleWrapper.appendChild(line);
    // titleWrapper.appendChild(toggleButton);
    contributionWrapper.appendChild(titleWrapper);

    const contentWrapper = document.createElement('div');
    contentWrapper.style.display = 'none'; // Initially hidden
    contentWrapper.style.marginLeft = '30px';

    if (contributors) {
        contentWrapper.appendChild(contributorDetailElement('creators', contributors.creators));
        contentWrapper.appendChild(document.createElement('hr'));
        contentWrapper.appendChild(contributorDetailElement('updators', contributors.updators));
        contentWrapper.appendChild(document.createElement('hr'));
        contentWrapper.appendChild(contributorDetailElement('suggestors', contributors.suggestors));
    }

    contributionWrapper.appendChild(contentWrapper);

    // Toggle functionality
    contributionWrapper.addEventListener('click', (e) => {
        e.preventDefault();
        if (contentWrapper.style.display === 'none') {
            contentWrapper.style.display = 'block';
            // toggleButton.textContent = '[-]';
        } else {
            contentWrapper.style.display = 'none';
            // toggleButton.textContent = '[+]';
        }
    });

    return contributionWrapper;
}
/**
 * Creates a dropdown select element.
 * @param nodes An array of objects, each with 'id' and 'name' properties.
 * @param identifier The ID and name attribute for the select element.
 * @param message The text for the default, non-selectable option when nodes exist.
 * @param zeroMessage The text for the default option when no nodes are provided.
 * @param hoverHandler A function to call when the mouse hovers over an option. It receives the node's ID.
 * @returns The created HTMLSelectElement.
 */
export function createDropdown(nodes: { id: string; name: string; }[], identifier: string, message: string, zeroMessage: string, hoverHandler: (id: string) => void): HTMLSelectElement {
    const select = document.createElement("select");
    select.id = identifier;
    select.name = identifier;
    select.className = 'dynamic-input';

    // Handle the case where there are no nodes
    if (nodes.length === 0) {
        const defaultOption = document.createElement("option");
        defaultOption.textContent = zeroMessage;
        defaultOption.value = "";
        select.appendChild(defaultOption);
        select.disabled = true;

        // Example: Disable a save button if it exists
        const saveButton = document.getElementById('allowed-save') as HTMLButtonElement | null;
        if (saveButton) {
            console.log('Disabling save button because dropdown is empty');
            saveButton.disabled = true;
            saveButton.style.backgroundColor = '#AAAAAA'; // Consider using CSS classes instead
        }
        return select;
    }

    // Create and append the default instructional option
    const defaultOption = document.createElement("option");
    defaultOption.textContent = message;
    defaultOption.value = ""; // Make sure it's not selectable as a valid value
    select.appendChild(defaultOption);

    // Create and append options for each node
    nodes.forEach(node => {
        const option = document.createElement("option");
        option.value = node.id; // Use node.id directly
        option.textContent = node.name;

        // --- Add mouseover event listener --- #NOT WORKING
        // --- End Optional ---
        select.appendChild(option);
    });

    return select;
}
export function hoverEffect(hoverHandler, nodeId) {
    const div = document.createElement('div');
    div.textContent = 'HOVER EFFECT TEST???';

    div.addEventListener('mouseover', () => {
        // Call the provided hoverHandler with the node's ID
        if (typeof hoverHandler === 'function') {
            const popup = document.getElementById('treePopUp');
            popup.style.display = 'block';

            hoverHandler(nodeId);
        }
    });

    // --- (optional) Add mouseout event listener to hide the popup-- - #NOT WORKING
    div.addEventListener('mouseout', () => {
        const popup = document.getElementById('treePopUp');
        if (popup) {
            popup.style.display = 'none';
        }
        popup.innerHTML = '';
    });
    return div;
}

